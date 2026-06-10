import type { Command } from 'commander'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { SkillResolver, composeSystemPrompt } from '@skillspace/runtime'
import { isLegacyV1Skill } from '@skillspace/schema'
import { intro } from '../ui/states/intro.js'
import { successStandard } from '../ui/states/success.js'
import { errorOperational } from '../ui/states/error.js'

export function registerExportCommand(program: Command): void {
  program
    .command('export <skill>')
    .description('Export a v2 Skill to an OpenAI-compatible system prompt JSON')
    .option('-o, --output <file>', 'Output JSON file path (defaults to <skill>.json)')
    .action((skillName: string, opts) => {
      intro('export', `Ejecting ${skillName}`)

      const resolver = new SkillResolver()
      let skill: any

      try {
        skill = resolver.resolve(skillName)
      } catch (err) {
        errorOperational('Skill not found', {
          message: `Could not resolve "${skillName}". Is it installed?`,
          hint: 'Run `skillspace list` to check.'
        })
        process.exit(1)
      }

      if (isLegacyV1Skill(skill)) {
        errorOperational('Incompatible Schema', {
          message: `"${skillName}" is a v1 Skill and cannot be exported using this command.`,
          hint: 'Run `skillspace migrate` first to upgrade your local skills.'
        })
        process.exit(1)
      }

      const systemPrompt = composeSystemPrompt(skill)
      
      const openAiExport = {
        model: skill.persona.preferred_model?.startsWith('openai/') 
          ? skill.persona.preferred_model.split('/')[1] 
          : 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          }
        ],
        temperature: 0.7 // Default for exported personas
      }

      const safeName = skillName.replace(/[^a-zA-Z0-9_-]/g, '_')
      const outputPath = opts.output || `${safeName}.json`
      const absolutePath = path.resolve(process.cwd(), outputPath)

      try {
        fs.writeFileSync(absolutePath, JSON.stringify(openAiExport, null, 2), 'utf-8')
      } catch (err) {
        errorOperational('Export failed', {
          message: `Could not write to ${absolutePath}`,
          hint: err instanceof Error ? err.message : String(err)
        })
        process.exit(1)
      }

      successStandard('Export Complete', {
        'Skill': `${skill.name}@${skill.version}`,
        'Output File': absolutePath,
        'Format': 'OpenAI Chat API'
      })
    })
}
