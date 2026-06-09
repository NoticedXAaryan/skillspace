import type { Command } from 'commander';
import { RegistryClient } from '../utils/api.js';
import { errorOperational } from '../ui/states/error.js';
import { box } from '../ui/layout/box.js';
import { c } from '../ui/tokens/colors.js';
import { createLoader } from '../ui/states/loader.js';

export function registerSearchCommand(program: Command): void {
  program
    .command('search <query>')
    .description('Search for skills in the registry')
    .option('-t, --type <type>', 'Filter by type (skill, agent, workflow)')
    .action(async (query: string, opts) => {
      const loader = createLoader(`Searching for "${query}"...`);
      try {
        const client = new RegistryClient();
        const result = await client.search(query, opts.type);

        if (result.error) {
          loader.fail('Search failed');
          errorOperational('Search Error', { message: result.error.message });
          process.exit(1);
        }

        const packages = result.data;
        if (!packages || packages.length === 0) {
          loader.succeed(`No packages found for "${query}"`);
          return;
        }

        loader.succeed(`Found ${result.meta?.total || packages.length} packages`);

        const rows = packages.map((pkg: any) => {
          const verified = pkg.verified ? c.success(' ✓') : '';
          const line1 = `${c.brand(pkg.name)}${verified} | v${pkg.latestVersion || '?'} by ${c.text(pkg.author)} | ↓${pkg.downloads}`;
          const line2 = `  ${c.textMuted(pkg.description)}`;
          const line3 = pkg.tags?.length > 0 ? `  ${c.textFaint('Tags:')} ${pkg.tags.join(', ')}` : '';
          return [line1, line2, line3].filter(Boolean).join('\n');
        });

        console.log(box(rows, {
          title: 'Search Results',
          colorFn: c.brand
        }));
      } catch (err) {
        loader.fail('Search failed');
        errorOperational('Search Error', { message: err instanceof Error ? err.message : String(err) });
        process.exit(1);
      }
    });
}
