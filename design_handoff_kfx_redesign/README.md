# Handoff — KFX Lending Dashboard Redesign

## Overview

KFX is an owner-operated micro-lending tracking app for a Philippines-based lending business. It tracks capital deployment, borrower balances, daily interest accrual (THAN), payments (BAYAD), late fees (MULTA), and the running cash position. The original implementation was a single long scrolling page — this redesign splits it into **4 focused screens** with a responsive layout that works on mobile, tablet, and desktop from one codebase.

**Target platform:** Web-first (responsive), with the constraint that the same component tree should be liftable into a native app (React Native, Flutter, Swift) later. Build mobile-first; scale up.

## About the Design Files

The files in this bundle are **HTML/JSX design references** — visual prototypes built in inline-React showing the intended look, behavior, and component composition. They are **not production code to ship as-is**. Your task is to **recreate these designs in the target codebase's existing environment** using its established patterns, state management, and component library. If no codebase exists yet, the recommended stack is documented below.

## Fidelity

**High-fidelity.** All colors, typography, spacing, radii, and component states are intentional and should be reproduced precisely. Sample data values come from the user's real screenshots and should be replaced with live state.

## Recommended Stack (if starting fresh)

- **Framework:** React + Vite (web) or Next.js. Component primitives are framework-agnostic, but the JSX maps 1:1 to React.
- **Styling:** CSS custom properties (already tokenised in `styles.css`) + plain CSS modules or Tailwind with token mapping. Avoid CSS-in-JS for theme tokens — they need to be runtime-swappable for dark mode + accent color + language.
- **State:** Local component state is sufficient for the prototype. For real data, expect Zustand / Redux Toolkit or TanStack Query against a backend. The data model is shaped in `data.jsx`.
- **i18n:** The translation dictionary lives in `index.html` (the `I18N` constant). Lift to `react-i18next` or equivalent. Three modes: `mix` (default — Bisaya verbs + English chrome), `en`, `bs`.
- **Routing:** Bottom-tab nav on mobile, sidebar on desktop. Use React Router or your framework's router; the 4 top-level routes are `/today`, `/borrowers`, `/money`, `/settings`. Borrower detail is `/borrowers/:id`.

## Information Architecture

Four primary tabs, in this order:

| Route          | Mobile presentation        | Desktop presentation       | Purpose |
|----------------|----------------------------|----------------------------|---------|
| `/today`       | Home — opens by default    | Sidebar item, default view | What needs action today: due today, overdue, multa pending, expected vs collected. The collection round screen. |
| `/borrowers`   | Searchable list            | Sidebar item               | List of all borrowers. Drill into any one for detail + actions. |
| `/borrowers/:id` | Full screen (back nav)   | Drawer or modal over list  | Single borrower — balance, stats, action buttons (bayad/palod/latepay/multa), ledger, close/archive. |
| `/money`       | Tab                        | Sidebar item               | Capital deployment chart, breakdown, reconciliation math, multa pending. |
| `/settings`    | Tab                        | Sidebar item               | THAN rate, total puhunan, language, theme, help. |

**Mobile global UI:** Bottom tab bar (4 items, fixed). FAB on Borrowers screen (`+` to add).
**Desktop global UI:** Left sidebar (240px), with the same 4 items + Quick Actions section (Bayad / Palod / Multa) + owner footer. Main content area is the active tab.

## Screens

### 1. Today (`/today`)

**Purpose:** Single-glance answer to "what do I need to do today?" Optimised for the daily collection round.

**Mobile layout (390 × 844):**
- Header: small day-of-week (`Thu, May 14`) + large title (greeting in selected language).
- **Hero card** ("To collect today"): big tabular-mono peso amount in accent color (`var(--accent)`). Three count pills (due / overdue / multa) below. Progress bar showing "collected so far" vs the expected total.
- **Quick action tiles** (3 cols): Bayad (success), Palod (accent), Multa (warning). 32px icon in a soft-tone square, label below.
- **Collection round list** in a card: one row per borrower needing action today. Avatar · name · status pill · expected amount · `+ Bayad` button.
- **Snapshot grid** (2×2): cash on hand, than today, collected this cycle, deployed.

**Desktop layout (1280 × 800):**
- Header strip: greeting + page title + Filter / Add borrower buttons.
- **KPI strip** (4 cards): To collect today (accent), Collected so far (success), Multa pending (warning), Cash available (text or danger if negative).
- **Two-column body:**
  - Left (1.6fr): "Today's collection list" table — borrower / balance / than/day / due now / `+ Bayad`. One row per borrower with action today.
  - Right (1fr): "Capital at work" card with deployment bar, "Than/day per borrower" mini bar chart.

### 2. Borrowers (`/borrowers`)

**Purpose:** Find a borrower fast, see status at a glance.

**Mobile:**
- Title + subtitle (count + deployed total).
- Search bar (40px, ghost style).
- Filter chips, horizontally scrollable: `All / Overdue / Due today / Multa / Paid` — each chip has a count badge. Active chip is solid `var(--text)`.
- List card with one row per borrower: avatar · name · ×N transaction count · status pill (+ multa pill if applicable) · balance + than/day right-aligned.
- FAB bottom-right (`+`) to add a borrower. Positioned 16px from right, 88px from bottom (above the bottom nav).

**Desktop:** Same content, full-width list instead of card; filters and search inline in the header row.

### 3. Borrower detail (`/borrowers/:id`)

**Purpose:** Full borrower context + all per-borrower actions. This is where palod/bayad/latepay/multa/close/archive live — they are NOT on the list view.

**Mobile:**
- Back nav (← Borrowers) + overflow menu.
- Avatar (56px) + name (h2) + status pills (overdue / due today).
- **Balance card:** eyebrow "Balance" + giant hero number + 3-col stat row (Released / Than / day / Collected).
- **Primary actions** (2×2 grid): `+ Bayad` (success, 48px), `+ Palod` (accent, 48px), `+ Latepay` (secondary), `+ Multa` (secondary).
- **Ledger** card — each transaction row: status-tinted icon · who · amount right-aligned · date + palod # below + status tag.
- Footer: `Close` (secondary) + `Archive` (ghost).

**Desktop:** Same content in a wider 2-column layout — balance + actions on left, ledger on right.

### 4. Money (`/money`)

**Purpose:** Deep view on capital, the equation behind cash position, and a single source of truth for the running totals that used to appear 3× on the old page.

**Mobile:**
- Title + "As of {date}" subtitle.
- **Hero "Capital at work" card:** eyebrow + big lent-out number + 2-segment deployment bar (lent / cash) + legend with both values.
- **Breakdown card:** 5-row list: Total puhunan / Lent out / Than collected / Unrealized / Cash on hand. Each row: label + sub + amount, color-coded by tone.
- **Reconcile card:** four equation rows showing Puhunan − Lent + Than Collected = Cash available. The final line is bold and toned by sign.
- **Multa pending callout:** full-width warning-tone card with `+ ₱3,150` and "not yet posted" sub.

### 5. Settings (`/settings`)

**Purpose:** Configure THAN rate, capital baseline, prefs. Rare — once a month / setup.

**Mobile:**
- Title.
- **Than rate & capital** card: editable rows (Daily rate / Total puhunan / Cash on hand) with a 3-column rate-peek grid (Daily / Weekly / Monthly auto-derived %).
- **Preferences** card: list rows for Language / Theme / Currency / Help — chevron right.
- Sign out (ghost, danger text).

### 6. Record Bayad sheet (modal/sheet from anywhere)

**Purpose:** The most common action — recording a payment.

**Pattern:** Bottom sheet on mobile, dialog on desktop.

- Drag handle.
- Borrower header (avatar + name + balance · than/day).
- Big tabular-mono amount input with suggested value.
- Preset chips: `₱1,000 / ₱2,000 / ₱4,181 (than) / ₱5,000 / Full balance`. The "× than" preset is in the accent-soft tone (highlighted as suggested).
- **Breakdown card** (sunken bg): Than charged / + Multa / − Bayad / New balance (bold).
- Footer: `Cancel` (secondary) + `Record bayad` (success, 2× flex).

## Design Tokens

All tokens are in `styles.css` as CSS custom properties on `:root`. Dark mode uses `[data-theme="dark"]` and overrides the same names. **Reproduce these exactly.**

### Colors — Light

| Token            | Value                       | Use |
|------------------|----------------------------|-----|
| `--bg`           | `oklch(98.5% 0.005 85)`     | App background (warm off-white) |
| `--surface`      | `#ffffff`                   | Cards |
| `--surface-2`    | `oklch(97% 0.006 85)`       | Subtle elevation |
| `--surface-sunk` | `oklch(96% 0.007 85)`       | Inset / sunken regions |
| `--border`       | `oklch(92% 0.008 85)`       | Default borders, dividers |
| `--border-strong`| `oklch(86% 0.01 85)`        | Input borders |
| `--text`         | `oklch(22% 0.015 250)`      | Primary text |
| `--text-2`       | `oklch(45% 0.015 250)`      | Secondary text |
| `--text-3`       | `oklch(62% 0.012 250)`      | Tertiary text / small |
| `--text-4`       | `oklch(75% 0.01 250)`       | Quaternary (chevrons) |
| `--accent`       | `oklch(48% 0.15 245)`       | Primary action color (default: banking blue) |
| `--accent-2`     | `oklch(54% 0.15 245)`       | Accent hover |
| `--accent-soft`  | `oklch(95% 0.03 245)`       | Accent background tints |
| `--success`      | `oklch(52% 0.13 155)`       | Bayad / collected / positive |
| `--success-soft` | `oklch(95% 0.04 155)`       | Success-tinted backgrounds |
| `--warning`      | `oklch(62% 0.16 65)`        | Multa, due today |
| `--warning-soft` | `oklch(95% 0.05 65)`        | Warning-tinted backgrounds |
| `--danger`       | `oklch(55% 0.21 25)`        | Overdue, negative cash |
| `--danger-soft`  | `oklch(96% 0.04 25)`        | Danger-tinted backgrounds |

### Colors — Dark

Apply `data-theme="dark"` on the root. See `styles.css` for the full dark palette. The two themes share token names — components do not branch on theme.

### Accent options (Tweakable)

| Hex | OKLCH approximate name |
|-----|---|
| `#2a6fdb` | Banking blue (default) |
| `#1f3a5c` | Navy |
| `#1f8a5b` | Green |
| `#c47a1a` | Amber |

### Spacing & radius

| Token   | Value |
|---------|-------|
| `--r-sm`| 8px   |
| `--r-md`| 12px  |
| `--r-lg`| 16px  |
| `--r-xl`| 22px  |
| `--r-2xl`| 28px |

Padding scale used in screens: 4 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 32px. Card internal padding is **14–20px** depending on density of content. Screen gutters are **20px** on mobile, **32px** on desktop.

### Shadows

| Token    | Value |
|----------|-------|
| `--sh-1` | `0 1px 2px rgba(20,25,40,.04), 0 1px 1px rgba(20,25,40,.03)` |
| `--sh-2` | `0 4px 16px rgba(20,25,40,.05), 0 1px 2px rgba(20,25,40,.04)` |
| `--sh-3` | `0 12px 32px rgba(20,25,40,.08), 0 4px 12px rgba(20,25,40,.05)` |

### Typography

| Family      | Source        | Use |
|-------------|---------------|-----|
| `Manrope`   | Google Fonts (400, 500, 600, 700, 800) | All UI |
| `JetBrains Mono` | Google Fonts (400, 500, 600, 700) | All numbers (peso amounts, percentages) |

**Type scale** (all sizes in px):

| Class         | Size | Weight | Letter-spacing | Use |
|---------------|------|--------|-----------------|-----|
| `.h1`         | 28   | 700    | -0.02em         | Screen titles (mobile); desktop title goes to 32 |
| `.h2`         | 20   | 700    | -0.015em        | Borrower name in detail header |
| `.h3`         | 16   | 600    | -0.01em         | Sub-headings |
| `.body`       | 14   | 400    | -0.005em        | Body copy |
| `.small`      | 12   | 400    | —               | Sub-labels, metadata |
| `.label`      | 13   | 500    | —               | Field labels |
| `.eyebrow`    | 11   | 600    | 0.08em uppercase | Section eyebrows |
| `.money-hero` | 40 (mobile) / 32+ (desktop KPI) | 600 mono | -0.03em | Hero amounts |
| `.money-lg`   | 22   | 600 mono | -0.02em       | Stat values |
| `.money`      | 14–15 | 600 mono | -0.01em      | Row amounts |
| `.money-sm`   | 13   | 500 mono | —             | Inline / secondary amounts |

**Critical:** All number-bearing elements get `font-variant-numeric: tabular-nums`. Peso sign `₱` is part of the formatted string (see `fmt()` in `data.jsx`).

### Components

#### Pill

```
height 22px · padding 0 8px · radius 999 · font 11/600 tabular
tones: success / warning / danger / accent / muted
each uses --{tone}-soft as bg and --{tone} as text
```

#### Button

```
height 44px (primary) / 32px (sm) / 26px (xs)
padding 0 16px (default)
radius var(--r-md) = 12px
font 14/600
```

Variants: `primary` (accent bg, on-accent text) · `secondary` (surface bg, border-strong border) · `ghost` (transparent) · `success` (success bg, white text) · `success-soft` (success-soft bg, success text).

#### Card

```
background var(--surface)
border 1px solid var(--border)
border-radius var(--r-lg) = 16px
```

Row inside card: `padding 14px 14–16px; border-bottom 1px solid var(--border)` (last row has no border).

#### Avatar

Circle, default 36px. `background` is the borrower's `avatar` color (see `data.jsx`). Initials are white, weight 700, ~36% of avatar size.

#### Bottom nav (mobile)

```
4 grid columns · padding 6px · border-top 1px var(--border) · bg var(--surface)
each item: column flex, gap 2px, padding 8px 0, font 10/600
active state: color var(--accent)
height: ~80px including safe-area (paddingBottom: 32)
```

#### Sidebar (desktop)

```
240px wide · border-right 1px var(--border) · bg var(--surface)
brand row: 28px logo + name + version
item: flex, gap 10px, padding 10px 12px, radius 10px, font 14/500
active: bg var(--accent-soft), color var(--accent), font-weight 600
```

#### FAB

```
56×56 circle · bg var(--accent) · color var(--on-accent)
position absolute bottom 88px right 16px
icon 24px plus
box-shadow var(--sh-3)
```

#### Deployment bar

Horizontal split bar, 8px tall, radius 999. Segments take `width: (segValue / total) * 100%` and use the passed color.

## Interactions

### Navigation
- Tap a bottom-nav item → switch tab (mobile)
- Tap a borrower row → push `/borrowers/:id` (mobile slides, desktop pushes detail panel)
- Tap back button on detail → pop to list

### Forms
- Bayad sheet preset chip → set amount input to that value
- "Full balance" preset → use `b.balance`
- Default suggested amount on bayad sheet = 1× the borrower's daily THAN

### State management

```ts
type Borrower = {
  id: string;
  name: string;
  initials: string;       // 2-char display initials
  avatar: string;         // hex color
  principal: number;      // total released
  than: number;           // daily interest accrued
  collected: number;      // total collected (nakulha)
  owed: number;           // negative when behind
  balance: number;        // current outstanding
  txCount: number;
  overdue: number;        // count of overdue palod transactions
  dueToday: number;       // count of palod transactions due today
  multa: number;          // pending late fee in peso
  status: 'active' | 'paid' | 'idle';
};

type Transaction = {
  d: string;              // display date "May 14"
  tag: string;            // "DUE TODAY" | "+6d overdue" | ""
  who: string;            // sub-borrower name (one borrower can have nested palods)
  palod: number;          // amount released
  thn: number;
  bayad: number;
  bal: number;            // running balance after this tx
  status: 'due' | 'overdue' | 'past';
};

type Capital = {
  puhunan: number;        // starting capital
  lentOut: number;
  cashOnHand: number;
  collected: number;
  thanAccrued: number;
  owed: number;           // negative
  multaPending: number;
  idle: number;           // negative when over-deployed
  borrowerCount: number;
};
```

### Theme / preferences
- `data-theme` attribute on `<html>` (or root) — `"light"` or `"dark"`.
- `--accent` / `--accent-2` / `--accent-soft` set inline on root to swap accent color.
- Language is a runtime translation dictionary lookup. Default `mix` mode keeps Bisaya verbs (palod, bayad, multa, than, puhunan, nakulha) with English chrome.

## Responsive behavior

Single breakpoint at the boundary between mobile and desktop. The decision tree:

| Width  | Nav      | Content gutters | Hero font | KPI strip |
|--------|----------|-----------------|-----------|-----------|
| < 768  | Bottom tabs | 20px         | 40px      | 2×2 grid below hero |
| 768–1080 | Bottom tabs or collapsible sidebar | 24px | 40px | 2×2 or 4×1 |
| ≥ 1080 | Sidebar (240px) | 32px       | 32px (KPI) | 4×1 KPI strip + 2-col body |

The same React components render in both layouts — the parent container chooses bottom-nav vs sidebar based on viewport. No new screens required for tablet; tablet just becomes "mobile width, sidebar".

## Files in this bundle

| File                  | Role |
|-----------------------|------|
| `index.html`          | Entry point. Hosts the design canvas, imports all .jsx, defines translations and theme tweaks. |
| `styles.css`          | All design tokens + base utility classes. **The single source of truth for the design system.** |
| `data.jsx`            | Sample data + the `fmt()` and `fmtCompact()` peso formatters. |
| `kit.jsx`             | Shared UI primitives: `Icon`, `Avatar`, `Pill`, `Money`, `Stat`, `BotNav`, `DeploymentBar`. |
| `screens-mobile.jsx`  | Mobile screens: `MobileShell`, `TodayScreen`, `BorrowersScreen`, `BorrowerDetail`. |
| `screens-extra.jsx`   | `MoneyScreen`, `SettingsScreen`, `DesktopApp`, `AddBayadSheet`. |

The `.jsx` files use plain in-browser Babel for the prototype — when you port to a real codebase, treat them as references for component structure and visual fidelity. The `styles.css` file can be lifted nearly as-is.

## Out of scope / not yet designed

These flows exist in the data model but weren't visualised this round — recreate the bayad sheet pattern for each:
- `+ Palod` (release new loan / sub-loan)
- `+ Latepay`
- `+ Multa` (record late fee)
- `Close` (mark borrower closed)
- `Archive` confirmation
- Add borrower
- THAN rate editor (inline editing on settings)
- Onboarding / "PAGSUGOD" help flow
