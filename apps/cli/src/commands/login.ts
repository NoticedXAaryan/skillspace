import type { Command } from 'commander';
import { saveCredentials, loadCredentials, clearCredentials } from '@skillspace/runtime';
import { RegistryClient } from '../utils/api.js';
import inquirer from 'inquirer';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Authenticate with the SkillSpace registry')
    .option('-e, --email <email>', 'Your email address')
    .option('-p, --password <password>', 'Your password')
    .action(async (opts) => {
      let email = opts.email;
      let password = opts.password;

      if (!email || !password) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'email',
            message: 'Email:',
            when: !email,
          },
          {
            type: 'password',
            name: 'password',
            message: 'Password:',
            when: !password,
          }
        ]);
        email = email || answers.email;
        password = password || answers.password;
      }

      if (!email || !password) {
        console.error('✗ Email and password are required.');
        process.exit(1);
      }

      try {
        const client = new RegistryClient();
        const result = await client.login(email, password);

        if (result.error) {
          console.error(`✗ Login failed: ${result.error.message}`);
          process.exit(1);
        }

        saveCredentials(result.data.token);
        console.log(`\n✓ Logged in as ${result.data.user.username}`);
      } catch (err) {
        console.error(`✗ Network error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });

  program
    .command('register')
    .description('Create a new SkillSpace account')
    .option('-u, --username <username>', 'Username (3-39 chars, alphanumeric)')
    .option('-e, --email <email>', 'Your email address')
    .option('-p, --password <password>', 'Password (min 8 chars)')
    .action(async (opts) => {
      let username = opts.username;
      let email = opts.email;
      let password = opts.password;

      if (!username || !email || !password) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'username',
            message: 'Username:',
            when: !username,
          },
          {
            type: 'input',
            name: 'email',
            message: 'Email:',
            when: !email,
          },
          {
            type: 'password',
            name: 'password',
            message: 'Password:',
            when: !password,
          }
        ]);
        username = username || answers.username;
        email = email || answers.email;
        password = password || answers.password;
      }

      if (!username || !email || !password) {
        console.error('✗ Username, email, and password are required.');
        process.exit(1);
      }

      try {
        const client = new RegistryClient();
        const result = await client.register(username, email, password);

        if (result.error) {
          console.error(`✗ Registration failed: ${result.error.message || JSON.stringify(result.error)}`);
          process.exit(1);
        }

        saveCredentials(result.data.token);
        console.log(`\n✓ Account created! Logged in as ${result.data.user.username}`);
      } catch (err) {
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
        console.log('Not logged in. Run `skillspace login` to authenticate.');
        return;
      }
      try {
        const client = new RegistryClient();
        const result = await client.me();
        if (result.error) {
          console.log('Session expired. Run `skillspace login` to re-authenticate.');
          return;
        }
        console.log(`Logged in as: ${result.data.username} (${result.data.email})`);
        console.log(`Plan: ${result.data.plan}`);
      } catch {
        console.error('✗ Could not reach registry.');
      }
    });
}
