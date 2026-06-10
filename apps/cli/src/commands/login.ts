import type { Command } from 'commander';
import { saveCredentials, loadCredentials, clearCredentials } from '@skillspace/runtime';
import { RegistryClient } from '../utils/api.js';
import { text, password as passwordPrompt, isCancel, cancel } from '@clack/prompts';
import { intro } from '../ui/states/intro.js';
import { outro } from '../ui/states/outro.js';
import { successStandard } from '../ui/states/success.js';
import { errorOperational } from '../ui/states/error.js';
import { createLoader } from '../ui/states/loader.js';
import { c } from '../ui/tokens/colors.js';
import { box } from '../ui/layout/box.js';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Authenticate with the SkillSpace registry')
    .option('-e, --email <email>', 'Your email address')
    .option('-p, --password <password>', 'Your password')
    .option('-y, --yes', 'Headless mode')
    .action(async (opts) => {
      const startTime = Date.now();
      let email = opts.email;
      let password = opts.password;

      if (!opts.yes && (!email || !password)) {
        intro('login', 'SkillSpace Authentication');
      }

      if (!opts.yes) {
        if (!email) {
          const emailInput = await text({
            message: 'Email:',
            placeholder: 'you@example.com',
          });
          if (isCancel(emailInput)) { cancel('Operation cancelled.'); process.exit(0); }
          email = emailInput;
        }

        if (!password) {
          const passInput = await passwordPrompt({
            message: 'Password:',
          });
          if (isCancel(passInput)) { cancel('Operation cancelled.'); process.exit(0); }
          password = passInput;
        }
      }

      if (!email || !password) {
        if (!opts.yes) {
          errorOperational('Missing credentials', { message: 'Email and password are required.' });
          process.exit(1);
        } else {
          console.error('✗ Email and password are required.');
          process.exit(1);
        }
      }

      const loader = !opts.yes ? createLoader('Authenticating...') : null;

      try {
        const client = new RegistryClient();
        const result = await client.login(email, password);

        if (result.error) {
          if (loader) loader.fail('Login failed.');
          errorOperational('Authentication Error', { message: result.error.message });
          process.exit(1);
        }

        saveCredentials(result.data.token);
        if (loader) {
          loader.succeed('Authenticated');
          successStandard('Login Successful', { Username: result.data.user.username });
          outro(Date.now() - startTime);
        } else {
          console.log(`✓ Logged in as ${result.data.user.username}`);
        }
      } catch (err) {
        if (loader) loader.fail('Network error.');
        errorOperational('Network Error', { message: err instanceof Error ? err.message : String(err) });
        process.exit(1);
      }
    });

  program
    .command('register')
    .description('Create a new SkillSpace account')
    .option('-u, --username <username>', 'Username (3-39 chars, alphanumeric)')
    .option('-e, --email <email>', 'Your email address')
    .option('-p, --password <password>', 'Password (min 8 chars)')
    .option('-y, --yes', 'Headless mode')
    .action(async (opts) => {
      const startTime = Date.now();
      let username = opts.username;
      let email = opts.email;
      let password = opts.password;

      if (!opts.yes && (!username || !email || !password)) {
        intro('register', 'SkillSpace Registration');
      }

      if (!opts.yes) {
        if (!username) {
          const usernameInput = await text({
            message: 'Username:',
            placeholder: 'my-username',
          });
          if (isCancel(usernameInput)) { cancel('Operation cancelled.'); process.exit(0); }
          username = usernameInput;
        }

        if (!email) {
          const emailInput = await text({
            message: 'Email:',
            placeholder: 'you@example.com',
          });
          if (isCancel(emailInput)) { cancel('Operation cancelled.'); process.exit(0); }
          email = emailInput;
        }

        if (!password) {
          const passInput = await passwordPrompt({
            message: 'Password (min 8 chars):',
          });
          if (isCancel(passInput)) { cancel('Operation cancelled.'); process.exit(0); }
          password = passInput;
        }
      }

      if (!username || !email || !password) {
        if (!opts.yes) {
          errorOperational('Missing fields', { message: 'Username, email, and password are required.' });
          process.exit(1);
        } else {
          console.error('✗ Username, email, and password are required.');
          process.exit(1);
        }
      }

      const loader = !opts.yes ? createLoader('Creating account...') : null;

      try {
        const client = new RegistryClient();
        const result = await client.register(username, email, password);

        if (result.error) {
          if (loader) loader.fail('Registration failed.');
          errorOperational('Registration Error', { message: result.error.message || JSON.stringify(result.error) });
          process.exit(1);
        }

        saveCredentials(result.data.token);
        if (loader) {
          loader.succeed('Account created');
          successStandard('Account Created Successfully', { Username: result.data.user.username });
          outro(Date.now() - startTime);
        } else {
          console.log(`✓ Account created! Logged in as ${result.data.user.username}`);
        }
      } catch (err) {
        if (loader) loader.fail('Network error.');
        errorOperational('Network Error', { message: err instanceof Error ? err.message : String(err) });
        process.exit(1);
      }
    });

  program
    .command('logout')
    .description('Clear stored credentials')
    .action(() => {
      clearCredentials();
      successStandard('Logged Out', { Status: 'Credentials cleared successfully.' });
    });
}

export function registerWhoamiCommand(program: Command): void {
  program
    .command('whoami')
    .description('Show currently authenticated user')
    .action(async () => {
      const loader = createLoader('Verifying session...');
      const token = loadCredentials();
      if (!token) {
        loader.fail('Not authenticated');
        console.log(box(['Not logged in.', 'Run `air login` to authenticate.'], { colorFn: c.border }));
        return;
      }
      try {
        const client = new RegistryClient();
        const result = await client.me();
        if (result.error) {
          loader.fail('Session expired');
          console.log(box(['Session expired.', 'Run `air login` to re-authenticate.'], { colorFn: c.warning }));
          return;
        }
        loader.succeed('Session active');
        
        console.log(box([
          `${c.textFaint('Username:')} ${c.brand(result.data.username)}`,
          `${c.textFaint('Email:')}    ${c.text(result.data.email)}`,
          `${c.textFaint('Plan:')}     ${c.text(result.data.plan)}`
        ], {
          title: 'Current User',
          colorFn: c.successDim
        }));
      } catch {
        loader.fail('Network error');
        errorOperational('Connection Error', { message: 'Could not reach registry.' });
      }
    });
}
