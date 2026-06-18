/**
 * Infers model compatibility from persona.preferred_model or capabilities.
 * Returns array like ['claude', 'openai', 'gemini', 'ollama']
 */
export function inferModelCompatibility(manifest: Record<string, unknown>): string[] {
  const models = new Set<string>(['claude', 'openai', 'gemini', 'ollama']); // all supported by runtime
  const persona = manifest?.persona as Record<string, unknown> | undefined;
  if (persona?.preferred_model) {
    const pref = String(persona.preferred_model).toLowerCase();
    if (pref.includes('claude') || pref.includes('anthropic')) return ['claude'];
    if (pref.includes('gpt') || pref.includes('openai')) return ['openai'];
    if (pref.includes('gemini') || pref.includes('google')) return ['gemini'];
    if (pref.includes('ollama')) return ['ollama'];
  }
  return Array.from(models);
}
