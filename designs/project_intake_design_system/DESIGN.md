---
name: Project Intake Design System
colors:
  surface: '#f5fafc'
  surface-dim: '#d5dbdd'
  surface-bright: '#f5fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4f7'
  surface-container: '#e9eff1'
  surface-container-high: '#e3e9eb'
  surface-container-highest: '#dee3e5'
  on-surface: '#171d1e'
  on-surface-variant: '#404849'
  inverse-surface: '#2b3133'
  inverse-on-surface: '#ecf2f4'
  outline: '#70797a'
  outline-variant: '#c0c8c9'
  surface-tint: '#33666c'
  primary: '#30636a'
  on-primary: '#ffffff'
  primary-container: '#4a7c83'
  on-primary-container: '#f6feff'
  inverse-primary: '#9ccfd7'
  secondary: '#00687b'
  on-secondary: '#ffffff'
  secondary-container: '#8be4fe'
  on-secondary-container: '#00667a'
  tertiary: '#006384'
  on-tertiary: '#ffffff'
  tertiary-container: '#007ea7'
  on-tertiary-container: '#fbfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b8ebf3'
  primary-fixed-dim: '#9ccfd7'
  on-primary-fixed: '#001f23'
  on-primary-fixed-variant: '#174e54'
  secondary-fixed: '#afecff'
  secondary-fixed-dim: '#79d3ec'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5d'
  tertiary-fixed: '#c2e8ff'
  tertiary-fixed-dim: '#75d1ff'
  on-tertiary-fixed: '#001e2b'
  on-tertiary-fixed-variant: '#004d67'
  background: '#f5fafc'
  on-background: '#171d1e'
  surface-variant: '#dee3e5'
typography:
  h1:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The brand personality of the design system is anchored in institutional trust and operational efficiency. Designed for high-stakes Project Management Office (PMO) environments, it evokes a sense of stability, precision, and authority. The visual language balances the weight of professional enterprise tools with the agility of modern SaaS.

The design style is **Corporate / Modern**. It prioritizes a clear information hierarchy, using structured layouts and a refined color palette to facilitate complex data entry and multi-stage approval workflows. Every element is designed to feel intentional and reliable, reducing the cognitive load for users managing large portfolios of project requests.

## Colors

The palette is led by **Muted Teal**, used primarily for high-level navigation, headers, and primary actions to establish a sense of modern professional authority and stability. **Dusty Cyan** provides a secondary grounding tone for supporting interface elements, while **Vivid Blue** serves as a vibrant tertiary accent. This brighter, high-energy accent color is reserved for specialized interactive elements, secondary call-to-actions, and distinct status indicators, providing visual relief against the more reserved primary tones.

The background uses a **Neutral Gray Tint** to define clear work areas and minimize eye strain, while **Medium Gray** borders and text variants provide structural definition. Semantic colors for success, error, and warning follow industry standards to ensure universal clarity in status reporting and form validation.

## Typography

The design system utilizes **Inter** across all levels. This choice provides a clean, highly legible typeface that excels in data-heavy enterprise environments. Inter’s tall x-height and neutral character make it ideal for both large headlines and small UI labels.

Headlines utilize heavier weights and tighter letter spacing to command attention, while body text is optimized with generous line heights to ensure readability during long project intake sessions. Labels are set in semi-bold to distinguish field descriptors from user input.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop views, centering content within a 1280px container to maintain focus during complex form completion. A 12-column grid system is used with 24px gutters to organize information into digestible sections.

A 4px baseline grid governs the vertical rhythm. Spacing between related form elements should use the `sm` (16px) unit, while major sections of the intake application should be separated by the `lg` (32px) or `xl` (48px) units to provide breathing room and visual distinction between different phases of the project lifecycle.

## Elevation & Depth

Hierarchy in the design system is conveyed through **Ambient Shadows** and tonal layering. The primary background acts as the base canvas. White surfaces are elevated above this background using soft, extra-diffused shadows with low opacity (approx. 4-8%) to represent active work areas or project cards.

Navigation bars and sidebars use the primary Muted Teal or secondary Dusty Cyan colors to create a "recessed" or "anchor" feel. Form inputs and secondary containers utilize low-contrast outlines rather than shadows to keep the interface clean and prevent "shadow fatigue" in dense information views.

## Shapes

The design system employs a **Soft** shape language. Standard UI elements like buttons, input fields, and tags feature a 0.25rem (4px) corner radius. Large containers, such as project cards or modal dialogs, use `rounded-lg` (8px) to soften the professional aesthetic without appearing overly casual. This restrained approach to roundedness reinforces the system's geometric and architectural character.

## Components

### Buttons & CTAs
Primary buttons use the Muted Teal background with white text, featuring a subtle shadow on hover to indicate interactivity. Secondary buttons use the Vivid Blue tertiary accent as an outline or text color to distinguish secondary paths with high visibility.

### Input Fields
Inputs are defined by 1px Neutral Gray borders, turning Muted Teal when focused. Validation states use Success Green or Error Red borders with accompanying caption text. Labels are always positioned above the field for maximum scanability.

### Cards & Sections
Project summaries are housed in white cards with a 1px border and a soft shadow. Use a Muted Teal top-border (2px-4px) for cards that represent high-priority or active project intakes.

### Lists & Tables
PMO data requires dense tables. Use alternating row colors or subtle borders for readability. Headers should be Dusty Cyan or Muted Teal with white text to establish clear column definitions.

### Progress Steppers
The project intake process is linear; use a stepper component at the top of the application. Completed steps use Muted Teal with a check icon, the active step uses Vivid Blue for focus, and future steps use Light Gray.