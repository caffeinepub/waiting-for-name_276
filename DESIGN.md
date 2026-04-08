# Design Brief

## Direction

KidiCare — Calm, data-forward pediatric health monitoring dashboard for caregivers. Light, spacious interface with deep ocean blue primary and warm coral alerts.

## Tone

Professional warmth meets playful clarity. Health UX that is welcoming and accessible, not corporate-stiff.

## Differentiation

Emotion detection as focal visual hierarchy (prominent emoji/status cards). Stress/distress alerts use warm accent prominently for immediate caregiver awareness.

## Color Palette

| Token      | OKLCH              | Role                                           |
| ---------- | ------------------ | ---------------------------------------------- |
| background | 0.98 0.008 230     | Cool off-white, calm foundation                |
| foreground | 0.18 0.015 230     | Deep cool text, high contrast on light         |
| card       | 1.0 0.004 230      | Pure white elevated surfaces                   |
| primary    | 0.42 0.14 240      | Deep ocean blue, trust & calm (hue 240)        |
| accent     | 0.68 0.18 25       | Warm coral/orange, stress/alert urgency        |
| muted      | 0.94 0.01 230      | Subtle backgrounds for secondary content       |
| destructive| 0.55 0.22 25       | Red alert overlay, high-priority warnings      |

## Typography

- Display: Space Grotesk — friendly-yet-professional headers (h1, h2, card titles)
- Body: Figtree — warm, readable paragraphs and UI labels (labels, timestamps, descriptions)
- Scale: Hero `text-4xl font-bold`, H2 `text-2xl font-bold`, Label `text-xs font-semibold uppercase`, Body `text-sm/base`

## Elevation & Depth

Subtle elevated card hierarchy using soft shadows (card: 0.07 opacity, elevated: 0.1 opacity) to create depth without drama. Pure white cards on cool background.

## Structural Zones

| Zone    | Background                  | Border           | Notes                                        |
| ------- | --------------------------- | ---------------- | -------------------------------------------- |
| Header  | background (0.98 0.008 230)| border-b subtle  | Title + breadcrumb, no elevation             |
| Cards   | card (1.0 0.004 230)       | rounded-lg 8px   | Elevated shadow, spacious padding 6x spacing |
| Alert   | accent (0.68 0.18 25)      | —                | High contrast white text, top banner         |
| Footer  | background (0.98 0.008 230)| border-t subtle  | Centered timestamp/sync status               |

## Spacing & Rhythm

Spacious 24px/32px section gaps. Card grid: 12px/16px gaps. Micro-spacing: 8px padding inside cards. Alternating card backgrounds (white/muted) create visual rhythm and prevent monotony.

## Component Patterns

- Buttons: Ocean blue primary, rounded-lg, hover: brightness 110%
- Cards: White background, subtle elevation shadow, 16px padding, rounded-lg
- Badges: Emotion status (emoji + label), stress gauge (linear bar with chart-colors), timestamp

## Motion

- Entrance: Fade-in 0.2s ease-out on dashboard load
- Hover: Brighten 2% + shadow elevation on card hover
- Updates: Smooth line chart transitions (0.3s) on 10s poll data refresh

## Constraints

- All colors via CSS custom properties (no hex/rgb literals in components)
- Chart colors use --chart-1 through --chart-5 OKLCH tokens
- No decorative graphics; data and UI elements only
- Dark mode uses luminance inversion (light 0.98 → dark 0.14); hue/chroma stable

## Signature Detail

Warm coral accent (hue 25, high chroma) inverts the healthcare cliché of green-for-success; stress/distress becomes the dominant alert signal, reflecting real-world caregiver priorities.
