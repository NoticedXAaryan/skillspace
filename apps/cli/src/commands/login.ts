import type { Command } from 'commander';
import { saveCredentials, loadCredentials, clearCredentials } from '@skillspace/runtime';
import { RegistryClient } from '../utils/api.js';

export function registerLoginCommand(program: Command): void {
  program
    .command('login')
    .description('Authenticate with the SkillSpace registry')
    .requiredOption('-e, --email <email>', 'Your email address')
    .requiredOption('-p, --password <password>', 'Your password')
    .action(async (opts) => {
      try {
        const client = new RegistryClient();
        const result = await client.login(opts.email, opts.password);

        if (result.error) {
          console.error(`✗ Login failed: ${result.error.message}`);
          process.exit(1);
        }

        saveCredentials(result.data.token);
        console.log(`✓ Logged in as ${result.data.user.username}`);
      } catch (err) {
        console.error(`✗ Network error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });

  program
    .command('register')
    .description('Create a new SkillSpace account')
    .requiredOption('-u, --username <username>', 'Username (3-39 chars, alphanumeric)')
    .requiredOption('-e, --email <email>', 'Your email address')
    .requiredOption('-p, --password <password>', 'Password (min 8 chars)')
    .action(async (opts) => {
      try {
        const client = new RegistryClient();
        const result = await client.register(opts.username, opts.email, opts.password);

        if (result.error) {
          console.error(`✗ Registration failed: ${JSON.stringify(result.error)}`);
          process.exit(1);
        }

        saveCredentials(result.data.token);
        console.log(`✓ Account created! Logged in as ${result.data.user.username}`);
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
