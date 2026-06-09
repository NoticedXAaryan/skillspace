import type { Command } from 'commander';
import { saveCredentials, loadCredentials, clearCredentials } from '@skillspace/runtime';
import { RegistryClient } from '../utils/api.js';
import { intro, text, password as passwordPrompt, isCancel, cancel, outro, spinner } from '@clack/prompts';
import pc from 'picocolors';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Authenticate with the AIR registry')
    .option('-e, --email <email>', 'Your email address')
    .option('-p, --password <password>', 'Your password')
    .option('-y, --yes', 'Headless mode')
    .action(async (opts) => {
      let email = opts.email;
      let password = opts.password;

      if (!opts.yes && (!email || !password)) {
        intro(pc.bgCyan(pc.black(' AIR Login ')));
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
        if (!opts.yes) cancel('Email and password are required.');
        else console.error('✗ Email and password are required.');
        process.exit(1);
      }

      const s = spinner();
      if (!opts.yes) s.start('Authenticating...');

      try {
        const client = new RegistryClient();
        const result = await client.login(email, password);

        if (result.error) {
          if (!opts.yes) s.stop('Login failed.');
          console.error(`✗ Login failed: ${result.error.message}`);
          process.exit(1);
        }

        saveCredentials(result.data.token);
        if (!opts.yes) {
          s.stop('Authenticated');
          outro(pc.green(`✓ Logged in as ${result.data.user.username}`));
        } else {
          console.log(`✓ Logged in as ${result.data.user.username}`);
        }
      } catch (err) {
        if (!opts.yes) s.stop('Network error.');
        console.error(`✗ Network error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });

  program
    .command('register')
    .description('Create a new AIR account')
    .option('-u, --username <username>', 'Username (3-39 chars, alphanumeric)')
    .option('-e, --email <email>', 'Your email address')
    .option('-p, --password <password>', 'Password (min 8 chars)')
    .option('-y, --yes', 'Headless mode')
    .action(async (opts) => {
      let username = opts.username;
      let email = opts.email;
      let password = opts.password;

      if (!opts.yes && (!username || !email || !password)) {
        intro(pc.bgCyan(pc.black(' AIR Registration ')));
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
        if (!opts.yes) cancel('Username, email, and password are required.');
        else console.error('✗ Username, email, and password are required.');
        process.exit(1);
      }

      const s = spinner();
      if (!opts.yes) s.start('Creating account...');

      try {
        const client = new RegistryClient();
        const result = await client.register(username, email, password);

        if (result.error) {
          if (!opts.yes) s.stop('Registration failed.');
          console.error(`✗ Registration failed: ${result.error.message || JSON.stringify(result.error)}`);
          process.exit(1);
        }

        saveCredentials(result.data.token);
        if (!opts.yes) {
          s.stop('Account created');
          outro(pc.green(`✓ Logged in as ${result.data.user.username}`));
        } else {
          console.log(`✓ Account created! Logged in as ${result.data.user.username}`);
        }
      } catch (err) {
        if (!opts.yes) s.stop('Network error.');
        console.error(`✗ Network error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });

  program
    .command('logout')
    .description('Clear stored credentials')
    .action(() => {
      clearCredentials();
      console.log('✓ Logged out successfully.');
    });
}

export function registerWhoamiCommand(program: Command): void {
  program
    .command('whoami')
    .description('Show currently authenticated user')
    .action(async () => {
      const token = loadCredentials();
      if (!token) {
        console.log('Not logged in. Run `air login` to authenticate.');
        return;
      }
      try {
        const client = new RegistryClient();
        const result = await client.me();
        if (result.error) {
          console.log('Session expired. Run `air login` to re-authenticate.');
          return;
        }
        console.log(`Logged in as: ${result.data.username} (${result.data.email})`);
        console.log(`Plan: ${result.data.plan}`);
      } catch {
        console.error('✗ Could not reach registry.');
      }
    });
}
