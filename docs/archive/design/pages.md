# Page-Specific UI Patterns

Reference for common SaaS/developer-tool page types. Load this file when building one of these page types.

---

## Auth Page (Sign In / Sign Up)

**Layout**: Centered card, full viewport, dark background with subtle grid or noise texture.

```
┌──────── viewport ────────┐
│                          │
│    Logo (top center)     │
│                          │
│  ┌──────────────────┐    │
│  │  Title           │    │
│  │  Subtitle        │    │
│  │                  │    │
│  │  [Social OAuth]  │    │
│  │  ─── or ───      │    │
│  │  Email input     │    │
│  │  Password input  │    │
│  │  [Submit CTA]    │    │
│  │                  │    │
│  │  Sign up link    │    │
│  └──────────────────┘    │
│                          │
│  Footer: ToS · Privacy   │
└──────────────────────────┘
```

**Key rules**:
- Card max-width: 400–440px
- Social OAuth buttons: icon + provider name, full width, outlined
- Divider: `─── Continue with email ───` not just `─── or ───`
- Error states: red border + red text below input (not toast)
- Never use a password strength meter on sign-in, only sign-up

---

## Landing Page (SaaS / Dev Tool)

**Section order**:
1. **Nav** — Logo left, links center, CTA right. Sticky. Blur backdrop on scroll.
2. **Hero** — Badge → H1 → Subhead → CTAs → Social proof / logos
3. **Feature Grid** — 3-col cards or alternating text+visual pairs
4. **How It Works** — Numbered steps or timeline (3 max)
5. **Code / Demo Showcase** — Syntax-highlighted code block or animated terminal
6. **Pricing** — 2–3 tier cards, most popular highlighted
7. **FAQ** — Accordion
8. **Footer** — Links grid + copyright

**Hero rules**:
- H1: 40–56px, max 8 words, no gradient text unless it's very subtle and brand-justified
- Avoid "AI-powered" or "next-generation" as hero copy
- Background: dark base + faint radial gradient from top center, OR dot/grid pattern at 5% opacity
- No hero illustration that looks stock or AI-generated

**Navbar rules**:
```css
.navbar {
  position: sticky; top: 0; z-index: 50;
  backdrop-filter: blur(12px);
  background: rgba(9, 9, 11, 0.8);
  border-bottom: 1px solid var(--border-subtle);
}
```

---

## Dashboard

**Shell**: Fixed sidebar (220px) + scrollable main + optional top bar

```
┌────────────────────────────────────────────────┐
│ Logo      Search                   Avatar      │  ← Top bar (optional)
├─────────┬──────────────────────────────────────┤
│ Nav     │  Page title      [Action button]     │
│         │  ─────────────────────────────────── │
│ Home    │  Stat cards (3–4 col grid)           │
│ Skills  │                                      │
│ Usage   │  Main content area                   │
│ Billing │  (table / chart / empty state)       │
│         │                                      │
│ Settings│                                      │
└─────────┴──────────────────────────────────────┘
```

**Stat card pattern**:
```html
<div class="stat-card">
  <span class="stat-label">Total Runs</span>
  <span class="stat-value">12,847</span>
  <span class="stat-delta positive">+12% this week</span>
</div>
```

**Table rules**:
- Compact rows: 36–40px height
- Alternating bg: even rows at `var(--bg-elevated)` or no alternating (hairline dividers preferred)
- Sticky header
- Actions column right-aligned: `···` menu or icon buttons on hover only
- Empty state: centered icon + heading + CTA (not just "No data")

---

## Settings Page

**Layout**: Two-column — subnav left (160px) + content right

**Section structure**:
```
Section Heading
Brief description text in muted color
──────────────────────────────────
Label            [Input / Toggle / Select]
Description      
──────────────────────────────────
Label            [Input / Toggle / Select]
Description      
──────────────────────────────────
                 [Save changes]
```

**Rules**:
- One "Save changes" button per section, bottom-right
- Destructive actions (delete account, revoke) in a separate "Danger Zone" card with red border
- Toggles > checkboxes for binary settings
- API keys: `•••••••••••••` with show/copy/revoke buttons inline

---

## Empty States

Every list, table, or data view needs an empty state. Pattern:

```
[Icon — 40px, muted color]
 
Heading — "No skills published yet"
Subtext  — "Publish your first skill to get started."

[Primary CTA — "Publish a skill →"]
```

Rules:
- Never just show a blank white/dark area
- Icon must be relevant to the content type
- CTA directly resolves the emptiness

---

## Code / Terminal Showcase

For dev tools, a syntax-highlighted code block is often the hero visual:

```css
.code-window {
  background: var(--bg-surface);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.code-titlebar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
}
.code-dot { width: 10px; height: 10px; border-radius: 50%; }
.code-dot-red    { background: #ff5f57; }
.code-dot-yellow { background: #febc2e; }
.code-dot-green  { background: #28c840; }
.code-body {
  padding: var(--space-4) var(--space-5);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.7;
  overflow-x: auto;
}
```

Add a tab switcher if showing multiple code examples (e.g. CLI / Node.js / Python).
