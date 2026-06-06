import type { Command } from 'commander';
import { RegistryClient } from '../utils/api.js';

export function registerSearchCommand(program: Command): void {
  program
    .command('search <query>')
    .description('Search for skills in the registry')
    .option('-t, --type <type>', 'Filter by type (skill, agent, workflow)')
    .action(async (query: string, opts) => {
      try {
        const client = new RegistryClient();
        const result = await client.search(query, opts.type);

        if (result.error) {
          console.error(`✗ ${result.error.message}`);
          process.exit(1);
        }

        const packages = result.data;
        if (!packages || packages.length === 0) {
          console.log(`No packages found for "${query}".`);
          return;
        }

        console.log(`Found ${result.meta?.total || packages.length} packages:\n`);

        for (const pkg of packages) {
          const verified = pkg.verified ? ' ✓' : '';
          console.log(`  ${pkg.name}${verified}`);
          console.log(`    ${pkg.description}`);
          console.log(`    v${pkg.latestVersion || '?'} · by ${pkg.author} · ↓${pkg.downloads}`);
          if (pkg.tags?.length > 0) {
            console.log(`    Tags: ${pkg.tags.join(', ')}`);
          }
          console.log('');
        }
      } catch (err) {
        console.error(`✗ Search failed: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });
}
