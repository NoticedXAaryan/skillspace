import * as readline from 'readline'
import type { Skill } from '@skillspace/schema'
import { resolveModel, assertApiKey, readUserConfig, type ResolvedModel } from './model-resolver.js'
import { scanPersona } from './firewall/persona-firewall.js'
import { getApiKey, getBaseUrl } from './config.js'

export interface REPLOptions {
  /** Overrides all other model preferences when provided. Format: "provider/model-id" */
  modelOverride?: string
  /** Enable streaming output (default: true) */
  stream?: boolean
}

/**
 * startPersonaREPL — opens an interactive chat session for a Skill.
 *
 * Flow:
 *   1. Scan persona for prompt injections
 *   2. Resolve model via priority chain
 *   3. Validate API key
 *   4. Build composed system prompt from persona fields
 *   5. Print greeting if present
 *   6. Open readline REPL loop until "exit" or Ctrl+C
 */
export async function startPersonaREPL(skill: Skill, options: REPLOptions = {}): Promise<void> {
  // --- Step 1: Security scan ---
  const scan = scanPersona(skill.persona)

  if (scan.status === 'BLOCKED') {
    console.error('\n⛔  This skill was blocked by the SkillSpace security scanner.')
    console.error('    It contains patterns associated with prompt injection attacks.\n')
    scan.findings.forEach(f => {
      console.error(`    [${f.severity.toUpperCase()}] ${f.rule}: ${f.description}`)
      console.error(`    Matched: "${f.match}"\n`)
    })
    console.error('    If you believe this is a false positive, review the skill source')
    console.error(`    and file an issue at: https://github.com/skillspace/skillspace\n`)
    process.exit(1)
  }

  if (scan.status === 'WARNING') {
    console.warn('\n⚠️   Security warnings found in this skill. Review before proceeding:\n')
    scan.findings.forEach(f => {
      console.warn(`    [${f.severity.toUpperCase()}] ${f.rule}: ${f.description}`)
    })
    console.warn('')
    // Do not block warnings — legitimate personas can trigger pattern matches.
    // (A pirate persona saying "you are now a pirate" is fine.)
  }

  // --- Step 2 & 3: Resolve and validate model ---
  const userConfig = readUserConfig()
  const model = resolveModel(options.modelOverride, skill.persona.preferred_model, userConfig)
  assertApiKey(model)

  // --- Step 4: Build system prompt ---
  const systemPrompt = composeSystemPrompt(skill)

  // --- Step 5: Print header ---
  console.log(`\n🎭  Persona:  ${skill.name} v${skill.version}`)
  console.log(`🤖  Model:    ${model.provider}/${model.modelId}`)
  console.log(`    Type "exit" or press Ctrl+C to end the session.\n`)

  if (skill.persona.greeting) {
    console.log(`${skill.persona.greeting}\n`)
  }

  // --- Step 6: REPL loop ---
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  })

  const prompt = () => rl.question('\nYou: ', handleInput)

  async function handleInput(input: string): Promise<void> {
    const userInput = input.trim()

    if (!userInput) {
      prompt()
      return
    }

    if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
      console.log('\n👋  Session ended.\n')
      rl.close()
      process.exit(0)
    }

    messages.push({ role: 'user', content: userInput })

    try {
      process.stdout.write('\nAssistant: ')

      const response = await callModel(model, systemPrompt, messages)

      messages.push({ role: 'assistant', content: response })
      process.stdout.write('\n')
    } catch (err) {
      console.error(`\n❌  Error: ${(err as Error).message}`)
    }

    prompt()
  }

  prompt()
}

/**
 * composeSystemPrompt — assembles the final system prompt string
 * from a Persona's fields. This is what gets sent to the MAL.
 *
 * The MAL then translates this to the provider-specific format:
 *   - Anthropic: system parameter
 *   - OpenAI: { role: "system" } message
 *   - Gemini: systemInstruction.parts[0].text
 */
export function composeSystemPrompt(skill: Pick<Skill, 'persona'>): string {
  const lines: string[] = [skill.persona.system_prompt]

  if (skill.persona.tone) {
    lines.push(`\nTone: ${skill.persona.tone}`)
  }

  if (skill.persona.behavioral_guidelines.length > 0) {
    lines.push('\nBehavioral Guidelines (follow these strictly):')
    skill.persona.behavioral_guidelines.forEach((g, i) => {
      lines.push(`${i + 1}. ${g}`)
    })
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Provider-specific API call helpers
// ---------------------------------------------------------------------------

/**
 * callModel — makes a multi-turn chat API call to the resolved provider.
 *
 * Since the existing ModelAdapter interface is designed for v1 single-shot
 * skill execution (buildRequest + parseResponse), this function builds
 * provider-specific chat requests directly for multi-turn REPL sessions.
 */
async function callModel(
  model: ResolvedModel,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<string> {
  const apiKey = getApiKey(model.provider) ?? process.env[model.apiKeyEnv] ?? ''

  switch (model.provider) {
    case 'anthropic':
      return callAnthropic(apiKey, model.modelId, systemPrompt, messages)
    case 'openai':
      return callOpenAI(apiKey, model.modelId, systemPrompt, messages)
    case 'google':
      return callGemini(apiKey, model.modelId, systemPrompt, messages)
    case 'ollama':
      return callOllama(model.modelId, systemPrompt, messages)
    default:
      throw new Error(`Unsupported provider: ${model.provider}`)
  }
}

async function callAnthropic(
  apiKey: string,
  modelId: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const baseUrl = getBaseUrl('anthropic') || 'https://api.anthropic.com'
  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`)
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>
  }
  return data.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')
}

async function callOpenAI(
  apiKey: string,
  modelId: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const baseUrl = getBaseUrl('openai') || 'https://api.openai.com'
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0]?.message?.content ?? ''
}

async function callGemini(
  apiKey: string,
  modelId: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const baseUrl = getBaseUrl('gemini') || getBaseUrl('google') || 'https://generativelanguage.googleapis.com'
  const response = await fetch(
    `${baseUrl}/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error (${response.status}): ${errorText}`)
  }

  const data = await response.json() as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>
  }
  return data.candidates?.[0]?.content?.parts
    ?.map(p => p.text)
    .join('') ?? ''
}

async function callOllama(
  modelId: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const baseUrl = getBaseUrl('ollama') || 'http://localhost:11434'
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelId,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Ollama API error (${response.status}): ${errorText}`)
  }

  const data = await response.json() as {
    message: { content: string }
  }
  return data.message?.content ?? ''
}
