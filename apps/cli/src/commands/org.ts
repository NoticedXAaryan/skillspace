import { Command } from 'commander';
import { RegistryClient } from '../utils/api.js';
import { errorOperational } from '../ui/states/error.js';
import { successStandard } from '../ui/states/success.js';
import { createLoader } from '../ui/states/loader.js';
import { box } from '../ui/layout/box.js';
import { c } from '../ui/tokens/colors.js';

export const orgCommand = new Command('org')
  .description('Manage organizations and teams');

orgCommand
  .command('create <name>')
  .description('Create a new organization')
  .option('--slug <slug>', 'Organization slug/handle')
  .action(async (name, options) => {
    const loader = createLoader(`Creating organization "${name}"...`);
    try {
      const client = new RegistryClient();
      const slug = options.slug || name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const result = await client.createOrg(name, slug);
      
      if (result.error) {
        loader.fail('Creation failed');
        errorOperational('Organization Error', { message: result.error });
        process.exit(1);
      }
      
      loader.succeed('Created successfully');
      successStandard('Organization Created', {
        Name: name,
        Handle: `@${slug}`
      });
    } catch (err) {
      loader.fail('Creation failed');
      errorOperational('System Error', { message: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
  });

orgCommand
  .command('invite <slug>')
  .description('Generate an invite link for an organization')
  .option('--role <role>', 'Role to assign (admin or member)', 'member')
  .action(async (slug, options) => {
    const loader = createLoader(`Generating invite for @${slug}...`);
    try {
      const client = new RegistryClient();
      const result = await client.createOrgInvite(slug, options.role);
      
      if (result.error) {
        loader.fail('Failed to generate invite');
        errorOperational('Invite Error', { message: result.error });
        process.exit(1);
      }
      
      loader.succeed('Invite generated');
      
      console.log(box([
        c.text('Share this token with your team member:'),
        '',
        `  ${c.brand(result.token)}`,
        '',
        c.textMuted(`They can join by running: air org join ${result.token}`),
        c.textFaint(`(Token expires in ${result.expires_in})`)
      ], { title: 'Organization Invite', colorFn: c.successDim }));
    } catch (err) {
      loader.fail('Failed to generate invite');
      errorOperational('System Error', { message: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
  });

orgCommand
  .command('join <token>')
  .description('Join an organization using an invite token')
  .action(async (token) => {
    const loader = createLoader('Joining organization...');
    try {
      const client = new RegistryClient();
      const result = await client.acceptOrgInvite(token);
      
      if (result.error) {
        loader.fail('Failed to join');
        errorOperational('Join Error', { message: result.error });
        process.exit(1);
      }
      
      loader.succeed('Joined successfully');
      successStandard('Organization Joined', { Status: 'You are now a member!' });
    } catch (err) {
      loader.fail('Failed to join');
      errorOperational('System Error', { message: err instanceof Error ? err.message : String(err) });
      process.exit(1);
    }
  });
