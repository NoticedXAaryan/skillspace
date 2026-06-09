import chalk from 'chalk';

export const c = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  brand:       chalk.hex('#A78BFA'),   // Electric violet — AIR's identity color
  brandDim:    chalk.hex('#7C3AED'),   // Deeper violet — hover states, borders
  brandSubtle: chalk.hex('#2E1065'),   // Near-black violet — background tints

  // ── Semantic ───────────────────────────────────────────────────────────────
  success:     chalk.hex('#34D399'),   // Emerald — agent deployed, task complete
  successDim:  chalk.hex('#065F46'),   // Deep emerald — success border / bg hint
  warning:     chalk.hex('#FBBF24'),   // Amber — degraded state, slow response
  warningDim:  chalk.hex('#78350F'),   // Deep amber — warning border
  error:       chalk.hex('#F87171'),   // Rose — hard failure, validation error
  errorDim:    chalk.hex('#7F1D1D'),   // Deep rose — error border
  info:        chalk.hex('#60A5FA'),   // Sky blue — neutral informational
  infoDim:     chalk.hex('#1E3A5F'),   // Deep sky — info border

  // ── Neutral Scale ──────────────────────────────────────────────────────────
  text:        chalk.hex('#F4F4F5'),   // Near-white — primary readable text
  textMuted:   chalk.hex('#A1A1AA'),   // Zinc 400 — secondary labels, hints
  textFaint:   chalk.hex('#52525B'),   // Zinc 600 — disabled, timestamps
  border:      chalk.hex('#3F3F46'),   // Zinc 700 — box borders, dividers
  borderSubtle:chalk.hex('#27272A'),   // Zinc 800 — inset borders
  bg:          chalk.hex('#18181B'),   // Zinc 900 — conceptual "background"
  
  // ── Special ────────────────────────────────────────────────────────────────
  accent:      chalk.hex('#E879F9'),   // Fuchsia — rare; agent names, IDs
  code:        chalk.hex('#A3E635'),   // Lime — inline code, paths, flags
  timestamp:   chalk.hex('#71717A'),   // Zinc 500 — time prefixes
};
