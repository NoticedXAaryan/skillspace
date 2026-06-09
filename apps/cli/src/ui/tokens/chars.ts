export const CHARS = {
  // ── Box Corners ────────────────────────────────────────────────────────────
  TL:          '╭',   // top-left
  TR:          '╮',   // top-right
  BL:          '╰',   // bottom-left
  BR:          '╯',   // bottom-right

  // ── Box Edges ──────────────────────────────────────────────────────────────
  H:           '─',   // horizontal
  V:           '│',   // vertical
  VL:          '├',   // vertical + right branch (for inline sections)
  VR:          '┤',   // vertical + left branch

  // ── Dividers ───────────────────────────────────────────────────────────────
  DIV:         '┄',   // dashed horizontal — soft section break
  DIVSOLID:    '─',   // solid horizontal — hard section break

  // ── List & Hierarchy ───────────────────────────────────────────────────────
  BULLET:      '○',   // unfilled — pending, inactive
  BULLET_FILL: '●',   // filled — active, selected
  BULLET_DONE: '◆',   // diamond — complete
  TREE_BRANCH: '├─',  // tree branch
  TREE_LAST:   '╰─',  // tree last child
  TREE_PIPE:   '│ ',  // tree continuation

  // ── Status Icons (monospace-safe, 1-char each) ─────────────────────────────
  TICK:        '✓',   // success
  CROSS:       '✗',   // error / failure
  WARN:        '⚠',   // warning
  INFO:        'ℹ',   // informational
  ARROW:       '→',   // flow direction, "next step"
  ARROW_RIGHT: '›',   // breadcrumb separator
  DOT:         '·',   // separator in meta lines
  ELLIPSIS:    '…',   // truncation

  // ── Spinner Frames (16-frame smooth arc) ───────────────────────────────────
  SPINNER: ['◜','◠','◝','◞','◡','◟'],
};
