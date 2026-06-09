import { Command } from 'commander';
import { RegistryClient } from '../utils/api.js';

export const orgCommand = new Command('org')
  .description('Manage organizations and teams');

orgCommand
  .command('create <name>')
  .description('Create a new organization')
  .option('--slug <slug>', 'Organization slug/handle')
  .action(async (name, options) => {
    try {
      const client = new RegistryClient();
      const slug = options.slug || name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const result = await client.createOrg(name, slug);
      
      if (result.error) {
        console.error(`❌ Failed to create org: ${result.error}`);
        process.exit(1);
      }
      
      console.log(`✅ Organization "${name}" (@${slug}) created successfully!`);
    } catch (err) {
      console.error(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

orgCommand
  .command('invite <slug>')
  .description('Generate an invite link for an organization')
  .option('--role <role>', 'Role to assign (admin or member)', 'member')
  .action(async (slug, options) => {
    try {
      const client = new RegistryClient();
      const result = await client.createOrgInvite(slug, options.role);
      
      if (result.error) {
        console.error(`❌ Failed to generate invite: ${result.error}`);
        process.exit(1);
      }
      
      console.log(`✅ Invite generated! Share this token with your team member:`);
      console.log(`\n    ${result.token}\n`);
      console.log(`They can join by running: air org join ${result.token}`);
      console.log(`(Token expires in ${result.expires_in})`);
    } catch (err) {
      console.error(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

orgCommand
  .command('join <token>')
  .description('Join an organization using an invite token')
  .action(async (token) => {
    try {
      const client = new RegistryClient();
      const result = await client.acceptOrgInvite(token);
      
      if (result.error) {
        console.error(`❌ Failed to join org: ${result.error}`);
        process.exit(1);
      }
      
      console.log(`✅ Successfully joined organization!`);
    } catch (err) {
      console.error(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });
