import type { Command } from 'commander'
import * as fs from 'node:fs'
import * as path from 'node:path'
import YAML from 'yaml'
import { isLegacyV1Skill, SCHEMA_VERSION } from '@skillspace/schema'
import { SkillCache } from '@skillspace/runtime'
import { intro } from '../ui/states/intro.js'
import { successStandard } from '../ui/states/success.js'
import { c } from '../ui/tokens/colors.js'

export function registerMigrateCommand(program: Command): void {
  program
    .command('migrate')
    .description('Locally migrate installed v1 Skills to the v2 Persona schema')
    .option('--dry-run', 'Preview migrations without saving')
    .action(async (opts) => {
      intro('migrate', 'Upgrading installed skills to v2 schema')

      const cache = new SkillCache()
      const installed = cache.listInstalled()
      
      if (installed.length === 0) {
        console.log(c.textFaint('No skills currently installed.\n'))
        return
      }

      let migratedCount = 0
      let skippedCount = 0

      for (const pkg of installed) {
        const yamlPath = path.join(pkg.path, 'skill.yaml')
        if (!fs.existsSync(yamlPath)) continue

        const raw = fs.readFileSync(yamlPath, 'utf-8')
        let parsed: any
        
        try {
          parsed = YAML.parse(raw)
        } catch (err) {
          console.warn(c.warning(`Skipping ${pkg.name}@${pkg.version}: Invalid YAML`))
          skippedCount++
          continue
        }

        if (!isLegacyV1Skill(parsed)) {
          console.log(c.textFaint(`Skipping ${pkg.name}@${pkg.version} (Already v2 or agent)`))
          skippedCount++
          continue
        }

        console.log(c.brand(`Migrating ${pkg.name}@${pkg.version}...`))

        // Convert v1 to v2
        const v2Skill = {
          schemaVersion: SCHEMA_VERSION,
          name: parsed.name,
          version: parsed.version,
          description: parsed.description,
          author: parsed.author,
          license: parsed.license || 'MIT',
          tags: parsed.tags || [],
          persona: {
            system_prompt: parsed.instructions?.system || 'You are a helpful assistant.',
            behavioral_guidelines: [],
            greeting: `Hello! I am ${parsed.name}, ready to assist you.`,
            capabilities: parsed.permissions || [],
          }
        }

        if (!opts.dryRun) {
          try {
            fs.writeFileSync(yamlPath, YAML.stringify(v2Skill), 'utf-8')
            migratedCount++
          } catch (err) {
            console.error(c.error(`Failed to write ${yamlPath}`))
            skippedCount++
          }
        } else {
          migratedCount++
        }
      }

      console.log('\n')
      successStandard('Migration Complete', {
        'Total Inspected': String(installed.length),
        'Migrated': String(migratedCount) + (opts.dryRun ? ' (dry-run)' : ''),
        'Skipped': String(skippedCount),
        'Target Schema': `v${SCHEMA_VERSION}`
      })
    })
}
