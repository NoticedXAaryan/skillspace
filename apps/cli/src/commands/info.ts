import type { Command } from 'commander';
import { RegistryClient } from '../utils/api.js';
import { box } from '../ui/layout/box.js';
import { errorOperational } from '../ui/states/error.js';
import { createLoader } from '../ui/states/loader.js';
import { c } from '../ui/tokens/colors.js';

export function registerInfoCommand(program: Command): void {
  program
    .command('info <package>')
    .description('Show detailed information about a package')
    .action(async (pkgName: string) => {
      const loader = createLoader(`Fetching info for ${pkgName}...`);
      try {
        const client = new RegistryClient();
        const result = await client.getPackage(pkgName);

        if (result.error) {
          loader.fail('Failed to fetch package');
          errorOperational('Registry Error', { message: result.error.message });
          process.exit(1);
        }

        loader.succeed(`Found ${pkgName}`);

        const pkg = result.data;
        const tags = Array.isArray(pkg.tags) ? pkg.tags : [];
        const latestVersion = pkg.latestVersion;

        const details = [
          `${c.textFaint('Description:')} ${c.text(pkg.description)}`,
          `${c.textFaint('Type:')}        ${c.brand(pkg.type)}`,
          `${c.textFaint('Author:')}      ${c.text(pkg.owner?.username || 'unknown')}`,
          `${c.textFaint('Downloads:')}   ${c.text(pkg.downloads?.toLocaleString() || '0')}`,
          `${c.textFaint('Verified:')}    ${pkg.verified ? c.success('✓ yes') : c.textMuted('no')}`,
        ];

        if (tags.length > 0) {
          details.push(`${c.textFaint('Tags:')}        ${tags.join(', ')}`);
        }

        if (latestVersion) {
          details.push('');
          details.push(c.textFaint('Latest Version:'));
          details.push(`  ${c.textFaint('Version:')}   ${c.brand(latestVersion.version)}`);
          details.push(`  ${c.textFaint('Published:')} ${c.textMuted(new Date(latestVersion.publishedAt).toLocaleDateString())}`);
          if (latestVersion.checksum) {
            details.push(`  ${c.textFaint('Checksum:')}  ${c.textMuted(latestVersion.checksum)}`);
          }
        }

        details.push('');
        details.push(c.textFaint('Install:'));
        details.push(`  ${c.border('skillspace install')} ${c.brand(pkg.name)}`);

        console.log(box(details, {
          title: pkg.name,
          colorFn: pkg.verified ? c.success : c.brand
        }));
      } catch (err) {
        loader.fail('Failed to fetch package');
        errorOperational('Registry Error', { message: err instanceof Error ? err.message : String(err) });
        process.exit(1);
      }
    });
}
