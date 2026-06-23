# Design System

## Color Palette

### Primary Colors
- **Dark Teal**: `#004e64` - Primary background, depth, authority
- **Turquoise Surf**: `#00a5cf` - Primary accent, CTAs, focus states
- **Verdigris**: `#25a18e` - Secondary accent, success states, positive actions

### Supporting Colors
- **Aquamarine**: `#9fffcb` - Highlights, hover states, decorative accents
- **Light Green**: `#7ae582` - Data visualization, alerts, complementary elements

### Neutrals (Tinted towards Dark Teal)
- **Surface Dark**: `#001a24` - Darkest backgrounds
- **Surface**: `#003844` - Cards, panels
- **Surface Light**: `#004e64` - Borders, dividers
- **Text Primary**: `#ffffff` - Main text
- **Text Secondary**: `#b3d9e8` - Supporting text
- **Text Tertiary**: `#7a9fb3` - Muted text

## Typography

### Font Stack
- **Display**: Inter, system-ui, sans-serif
- **Body**: Inter, system-ui, sans-serif
- **Mono**: JetBrains Mono, monospace

### Scale & Hierarchy
- **Display**: 3.5rem (56px) - Page heroes
- **H1**: 2.5rem (40px) - Section titles
- **H2**: 2rem (32px) - Subsection titles
- **H3**: 1.5rem (24px) - Card titles
- **Body Large**: 1.125rem (18px) - Introductions
- **Body**: 1rem (16px) - Main content
- **Body Small**: 0.875rem (14px) - Supporting text
- **Caption**: 0.75rem (12px) - Metadata, labels

### Weight Strategy
- **Bold**: 700 (headings, emphasis)
- **Semibold**: 600 (subheadings, strong accents)
- **Regular**: 400 (body content)

## Elevation & Depth

### Shadow System
- **Elevation 0**: No shadow (flat)
- **Elevation 1**: `0 1px 3px rgba(0, 0, 0, 0.3)` - Subtle hover states
- **Elevation 2**: `0 4px 12px rgba(0, 82, 102, 0.2)` - Cards, panels
- **Elevation 3**: `0 12px 24px rgba(0, 82, 102, 0.25)` - Modals, dropdowns
- **Elevation 4**: `0 20px 40px rgba(0, 82, 102, 0.3)` - Maximum depth

### Border & Stroke
- **Hairline**: 1px, `rgba(0, 165, 207, 0.2)` - Subtle dividers
- **Standard**: 2px, `#00a5cf` - Active states, focus rings
- **Strong**: 3px, `#25a18e` - Important boundaries

## Components

### Buttons
- **Primary**: Turquoise Surf background, Dark Teal text, rounded 6px
- **Secondary**: Dark Teal border, Turquoise Surf text, transparent background
- **Tertiary**: No border, Aquamarine text on hover
- **Disabled**: 40% opacity

### Cards
- **Background**: Surface (003844)
- **Border**: 1px Turquoise Surf @ 20% opacity
- **Padding**: 1.5rem (24px)
- **Border Radius**: 12px
- **Shadow**: Elevation 2

### Forms
- **Input Background**: Surface Dark (001a24)
- **Input Border**: Turquoise Surf @ 30% opacity, 1px
- **Focus State**: Border 2px solid Turquoise Surf, Aquamarine glow
- **Label**: Text Secondary, 0.875rem
- **Padding**: 12px 16px

### Data Viz
- **Primary Series**: Turquoise Surf
- **Secondary Series**: Verdigris
- **Tertiary Series**: Light Green
- **Error**: `#ff4757`
- **Success**: Aquamarine
- **Warning**: `#ffa502`

## Spacing

### Scale (8px base)
- 4px (0.5x)
- 8px (1x)
- 12px (1.5x)
- 16px (2x)
- 24px (3x)
- 32px (4x)
- 48px (6x)
- 64px (8x)

### Rules
- Content padding: 24px minimum
- Component spacing: 16px between elements
- Section spacing: 48px–64px between major sections
- Vertical rhythm: Vary spacing for visual hierarchy

## Motion

### Easing Curves
- **Entrance**: `cubic-bezier(0.34, 1.56, 0.64, 1)` (ease-out-back)
- **Exit**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out-quart)
- **Interaction**: `cubic-bezier(0.17, 0.67, 0.83, 0.67)` (ease-in-out)

### Durations
- **Fast**: 150ms (micro-interactions, hover states)
- **Standard**: 300ms (transitions, state changes)
- **Slow**: 500ms (page transitions, complex animations)

### Principles
- No layout animations (use transform instead)
- All transitions use exponential ease-out or ease-in-out
- Entrance animations are snappy and confident
- Exit animations are smooth and graceful

## Responsive

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px – 1024px
- **Desktop**: 1024px – 1440px
- **Ultra**: > 1440px

### Strategy
- Mobile-first design, scale up
- Touch targets: minimum 44px × 44px
- Content width cap: 1200px (desktop)

## Dark Theme Specifics

### Philosophy
Aquamarine robotics interface. Users operate in low-light or high-contrast environments. Teal is the guiding color—cool, technical, precise.

### Text Treatment
- High contrast for accessibility (WCAG AAA)
- Use tinted neutrals, never pure white or pure black
- Text Secondary (#b3d9e8) for supporting information

### Interactive States
- **Default**: Text Secondary
- **Hover**: Aquamarine highlight + Elevation 1
- **Active**: Turquoise Surf background + Aquamarine text
- **Focus**: 2px Aquamarine outline
- **Disabled**: 40% opacity, no interactions

## Usage Examples

### Hero Section
- Background: Dark Teal gradient to Surface Dark
- Accent: Turquoise Surf for CTAs
- Supporting text: Text Secondary

### Data Dashboard
- Cards: Surface background, Turquoise Surf borders
- Charts: Turquoise Surf primary, Verdigris secondary, Light Green tertiary
- Hover states: Aquamarine highlight

### Forms
- Labels: Text Secondary
- Inputs: Surface Dark background, Turquoise Surf focus state
- Validation: Light Green (success), #ff4757 (error)
- Helper text: Text Tertiary, 0.75rem
