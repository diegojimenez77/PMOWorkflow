---
name: Institutional Governance
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e0'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2fa'
  surface-container: '#f1ecf4'
  surface-container-high: '#ebe6ee'
  surface-container-highest: '#e5e1e9'
  on-surface: '#1c1b20'
  on-surface-variant: '#474551'
  inverse-surface: '#313036'
  inverse-on-surface: '#f4eff7'
  outline: '#787582'
  outline-variant: '#c8c4d3'
  surface-tint: '#5b53a6'
  primary: '#030021'
  on-primary: '#ffffff'
  primary-container: '#190863'
  on-primary-container: '#837bd1'
  inverse-primary: '#c6bfff'
  secondary: '#006688'
  on-secondary: '#ffffff'
  secondary-container: '#3ac6ff'
  on-secondary-container: '#004f6a'
  tertiary: '#0f0100'
  on-tertiary: '#ffffff'
  tertiary-container: '#3f0a00'
  on-tertiary-container: '#c36f57'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c6bfff'
  on-primary-fixed: '#160461'
  on-primary-fixed-variant: '#433b8d'
  secondary-fixed: '#c2e8ff'
  secondary-fixed-dim: '#75d1ff'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d67'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a0'
  on-tertiary-fixed: '#3b0900'
  on-tertiary-fixed-variant: '#76321f'
  background: '#fcf8ff'
  on-background: '#1c1b20'
  surface-variant: '#e5e1e9'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin: 32px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 40px
---

## Brand & Style

This design system is engineered for high-stakes banking PMO environments where clarity, authority, and precision are paramount. The aesthetic follows a **Corporate Modern** movement, characterized by structural stability, generous white space, and a refined color hierarchy that signals institutional reliability.

The target audience consists of portfolio managers, risk officers, and executive stakeholders who require a "source of truth" interface. The UI avoids decorative flourishes, focusing instead on data density and clear information architecture to evoke a sense of controlled efficiency and professional rigor.

## Colors

The palette is anchored by **Deep Navy Blue**, utilized for primary navigation and structural framing to establish a traditional banking foundation. **Tertiary Blue** serves as the functional driver, highlighting interactive elements and progress indicators. 

**Professional Orange** is applied sparingly as a high-visibility accent for critical calls-to-action or status warnings, ensuring they pierce the cool-toned environment. The background utilizes a **Clean Light Gray** to reduce eye strain during long-session data entry, while pure white is reserved for content cards and surface layers to create a distinct visual hierarchy.

## Typography

This design system utilizes **Inter** for its exceptional legibility in data-heavy environments. The typographic scale is optimized for a systematic, utilitarian feel. 

Headlines use tighter letter spacing and heavier weights to project authority. For financial data and project IDs, use the `data-tabular` style which enables tabular num features to ensure columns of figures align perfectly for easy comparison. Labels for metadata should utilize the uppercase format to distinguish between field headers and user-generated content.

## Layout & Spacing

The layout follows a **Fixed Grid** model centered within the viewport for a focused, dashboard-centric experience. A 12-column grid is employed with generous 24px gutters to allow complex forms and tables breathing room.

Spacing follows a strict 4px base unit. Component internal padding should favor vertical compactness to maximize "above the fold" visibility of project metrics, while external margins between sections should be expansive to signal clear separation between different governance workstreams.

## Elevation & Depth

To maintain a "solid" and "serious" tone, this design system avoids aggressive shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**. 

Depth is primarily communicated by stacking white surfaces on the light gray background, delineated by 1px borders in a muted gray-blue. High-elevation components, such as modal dialogues for project approvals, use an **Ambient Shadow** that is highly diffused (24px blur, 4% opacity) and slightly tinted with the primary navy color to maintain a cohesive atmospheric feel.

## Shapes

The shape language is **Soft** (Level 1). This choice balances modern software expectations with the rigidity required of a financial tool. 

A 0.25rem (4px) radius is applied to standard buttons and input fields, providing just enough refinement to feel modern without appearing "bubbly" or consumer-grade. Larger containers like project cards may use 0.5rem (8px) to soften the overall layout, but sharp corners are strictly avoided to prevent the UI from feeling dated or hostile.

## Components

### Buttons
Primary buttons use the Deep Navy Blue background with white text for maximum authority. Action-oriented buttons (e.g., "Submit Proposal") utilize the Tertiary Blue. The Accent Orange is reserved for destructive actions or critical overrides only.

### Cards
Cards are the primary container for project summaries. They must feature a 1px border (#E2E8F0) and no shadow when resting. On hover, a subtle Tertiary Blue top-border (2px) should appear to indicate interactivity.

### Form Inputs
Input fields use a white background with a subtle gray border. When focused, the border transitions to Tertiary Blue with a soft 2px outer glow of the same color. Labels must always be visible (never placeholder-only) to meet accessibility and governance standards.

### Status Badges
Governance states (e.g., "In Review," "Approved," "Risk Identified") use ghost-style chips. They feature a light tinted background of the status color with high-contrast text in the same hue.

### Data Tables
Tables are the heart of the system. Use "Zebra Striping" with the Background Light Gray on even rows. Headers must be "sticky" and use the `label-caps` typography style with a solid bottom divider.

### Additional Components
*   **Progress Steppers:** Vertical steppers for multi-stage project intake.
*   **Risk Indicators:** Circular gauges utilizing the Accent Orange for high-risk flags.
*   **Audit Trail:** A condensed list component with timestamps for tracking governance changes.