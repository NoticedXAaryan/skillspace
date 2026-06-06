import type { Command } from 'commander';
import { RegistryClient } from '../utils/api.js';

export function registerInfoCommand(program: Command): void {
  program
    .command('info <package>')
    .description('Show detailed information about a package')
    .action(async (pkgName: string) => {
      try {
        const client = new RegistryClient();
        const result = await client.getPackage(pkgName);

        if (result.error) {
          console.error(`✗ ${result.error.message}`);
          process.exit(1);
        }

        const pkg = result.data;
        const tags = Array.isArray(pkg.tags) ? pkg.tags : [];
        const latestVersion = pkg.latestVersion;

        console.log('');
        console.log(`  ${pkg.name}`);
        console.log('  ' + '─'.repeat(40));
        console.log(`  Description: ${pkg.description}`);
        console.log(`  Type:        ${pkg.type}`);
        console.log(`  Author:      ${pkg.owner?.username || 'unknown'}`);
        console.log(`  Downloads:   ${pkg.downloads?.toLocaleString()}`);
        console.log(`  Verified:    ${pkg.verified ? '✓ yes' : 'no'}`);

        if (tags.length > 0) {
          console.log(`  Tags:        ${tags.join(', ')}`);
        }

        if (latestVersion) {
          console.log('');
          console.log('  Latest Version:');
          console.log(`    Version:   ${latestVersion.version}`);
          console.log(`    Published: ${new Date(latestVersion.publishedAt).toLocaleDateString()}`);
          if (latestVersion.checksum) {
            console.log(`    Checksum:  ${latestVersion.checksum}`);
          }
        }

        console.log('');
        console.log(`  Install:`);
        console.log(`    skillspace install ${pkg.name}`);
        console.log('');
      } catch (err) {
        console.error(`✗ ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });
}
