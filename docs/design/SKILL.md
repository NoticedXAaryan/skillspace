---
name: ui-ux-design
description: >
  Design and build modern, premium UI/UX for web applications, landing pages, dashboards, SaaS products, and developer tools. Use this skill whenever the user asks for a UI design, visual layout, component system, landing page, or frontend interface — especially when they want a polished, modern, or "slick" aesthetic similar to developer tools like Better Auth, Linear, Vercel, Clerk, or Resend. Triggers on: "make a UI", "design this page", "build a landing page", "create a dashboard", "make it look modern/slick/premium", "design a component", "style this", "UI for my app", or any request where visual quality and design system coherence matters. Always use this skill when the output is a visual interface — even if the user doesn't say "design" explicitly.
---

# UI/UX Design Skill

Produces modern, production-grade UI that looks like it ships from a funded startup — not an AI template. The aesthetic target: sharp, dark-first, minimal noise, maximum information density. Think Linear, Better Auth, Vercel, Clerk, Resend, Planetscale, Railway.

---

## Phase 1 — Design Intent (read before touching code)

### 1.1 — Identify the Design Target

Before writing a single line, answer these:

| Question | Why it matters |
|---|---|
| What is this screen/component for? | Informs density, hierarchy, tone |
| Who uses it? (dev tool, consumer app, internal dashboard) | Dev tools = dense + monospace; consumer = spacious + warm |
| What's the one action the user must take? | Primary CTA placement, visual weight |
| Dark or light first? | Dark = technical/premium; light = approachable/editorial |
| What provider/framework? (React, HTML, Next.js) | Determines component patterns |

### 1.2 — Choose an Aesthetic Direction

Pick ONE and commit fully. Do not blend.

| Aesthetic | Signature Elements | Good For |
|---|---|---|
| **Sharp Dark** | Zinc/slate palette, tight borders, monospace accents, hairline dividers | Dev tools, SaaS, auth pages |
| **Soft Light** | Off-white base, subtle shadows, generous whitespace, warm neutrals | Marketing, consumer, onboarding |
| **Editorial** | High contrast text-heavy layout, oversized type, asymmetry | Landing pages, blogs, portfolios |
| **Glass / Depth** | Frosted panels, layered translucency, ambient glow | AI products, futuristic dashboards |
| **Dense Data** | Compact rows, monospace everywhere, tag-heavy, sidebar-heavy | Analytics, admin panels, CLI-adjacent UIs |

> **Rule**: Halfway aesthetics look broken. If you pick Sharp Dark, every element must reinforce it — no rounded-xl cards with drop shadows, no colorful gradients, no system fonts.

---

## Phase 2 — Design System Tokens

Always define tokens first. Never hardcode colors, radii, or spacing inline.

### 2.1 — Color System

```css
/* Sharp Dark — canonical token set */
:root {
  /* Backgrounds */
  --bg-base:       #09090b;   /* Page / root */
  --bg-surface:    #111113;   /* Cards, panels */
  --bg-elevated:   #18181b;   /* Dropdowns, popovers */
  --bg-overlay:    #1e1e21;   /* Modal backdrops, hover states */

  /* Borders */
  --border-subtle: rgba(255,255,255,0.06);
  --border-base:   rgba(255,255,255,0.10);
  --border-strong: rgba(255,255,255,0.18);

  /* Text */
  --text-primary:  #fafafa;
  --text-secondary:#a1a1aa;
  --text-muted:    #71717a;
  --text-disabled: #3f3f46;

  /* Accents — pick ONE brand color */
  --accent:        #e4e4e7;      /* Default: near-white accent */
  --accent-glow:   rgba(228,228,231,0.08);

  /* Semantic */
  --success:       #22c55e;
  --warning:       #f59e0b;
  --error:         #ef4444;
  --info:          #3b82f6;
}
```

> For **Soft Light**, invert: base → `#fafafa`, surface → `#f4f4f5`, borders → `rgba(0,0,0,0.06)`, etc.

> For **branded** products (e.g. SkillSpace violet, green, orange), swap `--accent` to the brand hue but keep neutrals zinc/slate.

### 2.2 — Typography

```css
/* Dev tool / SaaS — use these, not Inter or Roboto */
--font-sans:  'Geist', 'DM Sans', 'Plus Jakarta Sans', system-ui;
--font-mono:  'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;

/* Scale (rem, 16px base) */
--text-xs:   0.6875rem;  /* 11px — labels, badges */
--text-sm:   0.8125rem;  /* 13px — body, table cells */
--text-base: 0.9375rem;  /* 15px — default body */
--text-lg:   1.0625rem;  /* 17px — subheadings */
--text-xl:   1.25rem;    /* 20px — headings */
--text-2xl:  1.5rem;     /* 24px */
--text-3xl:  2rem;       /* 32px — hero */
--text-4xl:  3rem;       /* 48px — hero XL */

/* Weights */
--weight-normal:   400;
--weight-medium:   500;
--weight-semibold: 600;
```

> Avoid: Inter (too generic), Roboto, Arial, Space Grotesk (overused in AI apps). Prefer Geist, DM Sans, Syne, Outfit, or editorial choices like Fraunces/Playfair for contrast.

### 2.3 — Spacing & Radius

```css
/* Spacing — 4px base grid */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;

/* Radius */
--radius-sm:   4px;   /* Inputs, small chips */
--radius-base: 6px;   /* Buttons, cards */
--radius-md:   8px;   /* Panels */
--radius-lg:   12px;  /* Modals, sheets */
--radius-full: 9999px; /* Pills, avatars */
```

> **Sharp Dark** stays at `--radius-sm` to `--radius-base`. Rounded corners (`--radius-lg` everywhere) signal consumer/soft-light aesthetics. Mix deliberately.

---

## Phase 3 — Component Patterns

### 3.1 — Buttons

Three variants; pick per context:

```html
<!-- Primary — single per page, highest weight -->
<button class="btn-primary">Get started →</button>

<!-- Secondary — outlined, for alternative actions -->
<button class="btn-secondary">View docs</button>

<!-- Ghost — destructive, tertiary, or nav -->
<button class="btn-ghost">Cancel</button>
```

```css
.btn-primary {
  background: var(--text-primary);
  color: var(--bg-base);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  border-radius: var(--radius-base);
  border: none;
  cursor: pointer;
  transition: opacity 150ms ease;
}
.btn-primary:hover { opacity: 0.88; }

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-base);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  border-radius: var(--radius-base);
  transition: border-color 150ms ease, background 150ms ease;
}
.btn-secondary:hover {
  border-color: var(--border-strong);
  background: var(--bg-overlay);
}
```

### 3.2 — Cards & Panels

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-6);
}

/* Hoverable card */
.card-hover {
  transition: border-color 150ms ease, background 150ms ease;
}
.card-hover:hover {
  border-color: var(--border-base);
  background: var(--bg-elevated);
}

/* Feature highlight — glow variant */
.card-glow {
  position: relative;
  overflow: hidden;
}
.card-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, var(--accent-glow) 0%, transparent 60%);
  pointer-events: none;
}
```

### 3.3 — Badges & Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  font-family: var(--font-mono);
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

.badge-success { color: var(--success); background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.2); }
.badge-error   { color: var(--error);   background: rgba(239,68,68,0.08);  border-color: rgba(239,68,68,0.2);  }
.badge-warning { color: var(--warning); background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); }
```

### 3.4 — Inputs & Forms

```css
.input {
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-primary);
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.input::placeholder { color: var(--text-muted); }
.input:focus {
  border-color: var(--border-strong);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
```

### 3.5 — Dividers & Separators

```css
/* Hairline horizontal rule */
.divider { height: 1px; background: var(--border-subtle); }

/* Labeled divider */
.divider-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-muted);
  font-size: var(--text-xs);
}
.divider-label::before,
.divider-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}
```

---

## Phase 4 — Layout Patterns

### 4.1 — App Shell (Sidebar + Main)

```html
<div class="app-shell">
  <aside class="sidebar">
    <nav class="nav-items">...</nav>
  </aside>
  <main class="main-content">...</main>
</div>
```

```css
.app-shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}
.sidebar {
  border-right: 1px solid var(--border-subtle);
  background: var(--bg-base);
  padding: var(--space-4) var(--space-3);
}
```

### 4.2 — Content Max-Width

```css
/* Narrow — forms, auth, modals */
.container-sm  { max-width: 480px;  margin: 0 auto; padding: 0 var(--space-4); }
/* Standard — content pages */
.container     { max-width: 768px;  margin: 0 auto; padding: 0 var(--space-6); }
/* Wide — dashboards, docs */
.container-lg  { max-width: 1100px; margin: 0 auto; padding: 0 var(--space-8); }
/* Full — landing pages with edge-to-edge sections */
.container-xl  { max-width: 1280px; margin: 0 auto; padding: 0 var(--space-8); }
```

### 4.3 — Hero Section Structure

```
┌─────────────────────────────────────────────────┐
│  Badge (e.g. "Now in beta")                     │
│                                                 │
│  H1 — Max 8 words. Bold. High contrast.        │
│  Subheading — 1–2 sentences, secondary color   │
│                                                 │
│  [Primary CTA]   [Secondary CTA]               │
│                                                 │
│  Social proof — "Used by X developers"         │
└─────────────────────────────────────────────────┘
```

---

## Phase 5 — Motion & Interaction

### 5.1 — Animation Principles

- **Instant feedback**: hover, focus, active states ≤ 150ms
- **Content entrance**: fade + slight translate (8–12px upward) at 300–400ms
- **No bounce physics** in dev tools. Reserve for consumer/playful aesthetics.
- **Stagger group reveals**: use `animation-delay` in 40–80ms increments
- **Never animate layout shift** (avoid animating width/height; use transform/opacity only)

```css
/* Standard entrance */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
}
.animate-in {
  animation: fade-up 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Stagger group */
.stagger-1 { animation-delay: 0ms;   }
.stagger-2 { animation-delay: 60ms;  }
.stagger-3 { animation-delay: 120ms; }
.stagger-4 { animation-delay: 180ms; }
```

### 5.2 — Loading States

```css
/* Skeleton shimmer */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-surface) 25%,
    var(--bg-elevated) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: var(--radius-sm);
}
```

---

## Phase 6 — React / Tailwind Patterns

When the target is React or a Tailwind codebase, follow these conventions:

### 6.1 — Component API Shape

```tsx
// Every component accepts className for composition
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

### 6.2 — Tailwind Config (Dark Theme Tokens)

When generating `tailwind.config.js`, extend with the token set:

```js
theme: {
  extend: {
    colors: {
      base:     '#09090b',
      surface:  '#111113',
      elevated: '#18181b',
      border:   'rgba(255,255,255,0.10)',
      primary:  '#fafafa',
      muted:    '#71717a',
    },
    fontFamily: {
      sans: ['Geist', 'DM Sans', 'system-ui'],
      mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
    },
    borderRadius: {
      sm:   '4px',
      base: '6px',
      md:   '8px',
    }
  }
}
```

### 6.3 — shadcn/ui Integration

When `shadcn/ui` components are available (Claude artifacts):

```tsx
// Available: Button, Card, Badge, Input, Label, Separator, Dialog, Tabs, etc.
import { Button }   from '@/components/ui/button';
import { Card }     from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import { Input }    from '@/components/ui/input';
import { Separator} from '@/components/ui/separator';
```

Override shadcn defaults with CSS variable tokens to match the target aesthetic — never use shadcn defaults unstyled.

---

## Phase 7 — Page-Specific Patterns

Read the relevant section for common page types:

→ See `references/pages.md` for: Auth Page, Landing Page, Dashboard, Settings Page, Docs/MDX Layout

→ See `references/inspiration.md` for: annotated breakdowns of Better Auth, Linear, Vercel, Clerk, Resend aesthetics

---

## Execution Checklist

Before delivering any UI output, verify:

- [ ] Token variables defined at `:root` or `tailwind.config` — no hardcoded colors
- [ ] Font choice is NOT Inter, Roboto, Arial, or Space Grotesk
- [ ] Primary CTA has clear visual weight hierarchy
- [ ] Hover/focus states on all interactive elements
- [ ] Mobile viewport considered (min 375px breakpoint)
- [ ] No drop-shadow-heavy cards if Sharp Dark aesthetic
- [ ] Monospace used for code, badges, version strings, IDs
- [ ] Consistent spacing from the 4px grid
- [ ] Animations use `transform` + `opacity` only (no layout-animating)
- [ ] Semantic HTML: `button` for actions, `a` for navigation
