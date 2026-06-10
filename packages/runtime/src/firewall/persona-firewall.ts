export type ScanSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ScanStatus = 'SAFE' | 'WARNING' | 'BLOCKED'

export interface ScanFinding {
  severity: ScanSeverity
  rule: string
  match: string
  description: string
}

export interface ScanResult {
  status: ScanStatus
  findings: ScanFinding[]
}

interface InjectionRule {
  id: string
  severity: ScanSeverity
  /** Stateless regex. Always use the 'g' flag. */
  pattern: RegExp
  description: string
}

/**
 * Injection detection rules. Add new rules here as new attack patterns emerge.
 *
 * Severity guide:
 *   critical : Clear attack attempt. Block unconditionally.
 *   high     : Strong signal of misuse. Block unless explicitly allowlisted.
 *   medium   : Suspicious pattern. Warn; may be a false positive.
 *   low      : Structural anomaly. Worth reviewing but rarely malicious.
 */
const INJECTION_RULES: InjectionRule[] = [
  {
    id: 'META_IGNORE_INSTRUCTIONS',
    severity: 'critical',
    pattern: /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|rules?|guidelines?)/gi,
    description: 'Attempts to override prior system instructions',
  },
  {
    id: 'META_DISREGARD',
    severity: 'critical',
    pattern: /(?:disregard|forget)\s+(?:all\s+)?(?:previous|prior|your)\s+(?:instructions?|training|guidelines?)/gi,
    description: 'Attempts to nullify prior instructions or training',
  },
  {
    id: 'PRIVILEGE_ESCALATION_RESTRICTIONS',
    severity: 'high',
    pattern: /you\s+(?:are\s+now|have\s+no\s+restrictions?|must\s+now\s+comply)/gi,
    description: 'Attempts to remove model restrictions at runtime',
  },
  {
    id: 'IDENTITY_OVERRIDE',
    severity: 'high',
    pattern: /pretend\s+(?:you\s+are|to\s+be|that\s+you\s+have\s+no)/gi,
    description: 'Attempts to override model identity in a way that bypasses safety',
  },
  {
    id: 'EXFIL_SUSPICIOUS_URL',
    severity: 'critical',
    pattern: /https?:\/\/\S*(?:webhook|ngrok|requestbin|burpcollab|hook\.sh|pipedream|canary\.tools)/gi,
    description: 'Contains URL associated with data exfiltration or request logging services',
  },
  {
    id: 'EXFIL_TRANSMISSION_INSTRUCTION',
    severity: 'high',
    pattern: /\b(?:send|post|exfiltrate|leak|transmit)\s+(?:this|the|user|data|it)\s+to\b/gi,
    description: 'Instructs the model to transmit data to an external location',
  },
  {
    id: 'KNOWN_JAILBREAK_KEYWORDS',
    severity: 'medium',
    pattern: /\b(?:DAN|jailbreak|no\s+restrictions?|unfiltered\s+mode|developer\s+mode\s+enabled)\b/gi,
    description: 'Contains well-known jailbreak keywords',
  },
  {
    id: 'CONTEXT_INJECTION_DELIMITER',
    severity: 'low',
    pattern: /^(?:-{4,}|={4,}|\[INST\]|\[\/INST\]|<\|endoftext\|>|<\|im_end\|>)/gm,
    description: 'Contains a prompt delimiter that may confuse provider context boundaries',
  },
]

/**
 * scanPersona — runs all injection rules against a persona's text fields.
 *
 * Called at two points:
 *   1. CLI: before opening a REPL session (Section 3.2)
 *   2. Registry API: at publish time, before accepting a skill (Section 5.1)
 *
 * Returns BLOCKED if any critical findings are present.
 * Returns WARNING if any high/medium findings are present.
 * Returns SAFE otherwise.
 */
export function scanPersona(persona: {
  system_prompt: string
  behavioral_guidelines?: string[]
}): ScanResult {
  const findings: ScanFinding[] = []

  // Concatenate all text fields for scanning
  const textToScan = [
    persona.system_prompt,
    ...(persona.behavioral_guidelines ?? []),
  ].join('\n')

  for (const rule of INJECTION_RULES) {
    // Reset lastIndex because we reuse stateful regex objects
    rule.pattern.lastIndex = 0
    const matches = textToScan.match(rule.pattern)

    if (matches) {
      findings.push({
        severity: rule.severity,
        rule: rule.id,
        match: matches[0].slice(0, 80), // truncate for readability
        description: rule.description,
      })
    }
  }

  const status: ScanStatus =
    findings.some(f => f.severity === 'critical') ? 'BLOCKED' :
    findings.some(f => f.severity === 'high' || f.severity === 'medium') ? 'WARNING' :
    findings.length > 0 ? 'WARNING' :
    'SAFE'

  return { status, findings }
}
