# Military Asset Management System - Design Guidelines

## Design Approach
**System Foundation**: Fluent Design + Custom Tactical Military Aesthetic
**Inspiration**: Military command centers, tactical operations dashboards, enterprise defense systems
**Core Principle**: Information clarity under pressure with purposeful hierarchy and strategic color usage

## Typography System
- **Primary Font**: Inter (via Google Fonts CDN) - exceptional clarity at small sizes
- **Headings**: 
  - H1: 2.5rem, font-weight 700, letter-spacing -0.02em, uppercase
  - H2: 2rem, font-weight 600, uppercase
  - H3: 1.5rem, font-weight 600
- **Body**: 0.875rem base, font-weight 400, line-height 1.6
- **UI Labels**: 0.75rem, font-weight 600, uppercase, letter-spacing 0.05em, tactical precision
- **Data/Numbers**: Tabular numerals, monospace fallback for asset IDs

## Layout & Spacing System
**Tailwind Units**: Consistent use of 4, 6, 8, 12, 16, 24 for rhythm
- Component padding: p-6 standard, p-8 for emphasized cards
- Section spacing: space-y-6 for related groups, space-y-12 between major sections
- Grid gaps: gap-6 for cards, gap-4 for tight data tables

## Component Architecture

**Dashboard Structure**:
- Top navigation bar (h-16) with sticky positioning
- Left sidebar (w-64) collapsible to icon-only (w-20)
- Main content area with max-w-7xl container
- Right panel (w-80) for contextual actions/notifications

**Navigation Bar**:
- System logo/insignia (left)
- Breadcrumb navigation (center)
- User profile dropdown with role badge, notifications bell with count indicator, global search (right)
- Height: h-16, backdrop blur with subtle border-bottom

**Sidebar Navigation**:
- Hierarchical menu with expandable sections
- Active state: full-width accent bar (4px left border)
- Icons: Heroicons (tactical variants - shield, server, users, chart-bar, cog)
- Badge indicators for urgent counts on inventory/alerts
- Role-based menu items with permission indicators

**Hero Section** (Dashboard Landing):
- Full-width header (h-72) with background image
- Image: Tactical operations center, satellite imagery, or military base aerial view with subtle dark overlay (opacity-60)
- Centered content: Large welcome text "Command Center" or unit designation
- Quick stats cards (3-4) overlaying bottom of hero: Active Assets, Personnel, Budget Status, Critical Alerts
- Buttons with backdrop-blur-md and semi-transparent dark backgrounds

**Card Components**:
- Primary cards: Rounded corners (rounded-lg), border (border-2), shadow-lg
- Header section with title + action button
- Content area with generous padding (p-6)
- Footer for metadata/timestamps
- Hover: subtle transform scale-105 and enhanced shadow

**Data Tables**:
- Sticky header row with sorting indicators
- Alternating row background for readability
- Right-aligned numerical columns
- Action column (right) with icon buttons
- Compact row height (h-12) for information density
- Expandable rows for detailed asset information

**Forms & Inputs**:
- Input fields: h-10, rounded-md, border-2, px-4
- Focus states: Tactical green ring
- Required fields marked with asterisk
- Help text below inputs (text-xs)
- Multi-step forms with progress indicator (horizontal stepper)
- Validation states with inline icons and messages

**Budget/Financial Components**:
- Large numerical displays with currency formatting
- Progress bars showing budget utilization (segmented for categories)
- Trend indicators with directional arrows
- Comparison charts (current vs. allocated)
- Alert thresholds with color-coded warnings

**User Management Interface**:
- User cards in grid layout (grid-cols-3 lg:grid-cols-4)
- Avatar, name, role badge, status indicator
- Permissions matrix table with checkbox toggles
- Role assignment dropdown with hierarchical structure
- Activity logs with timestamp and action type

**Inventory Tracking**:
- Asset cards with thumbnail, ID, status badge, location
- Filter sidebar with multi-select categories
- Map integration placeholder for geographic asset distribution
- QR code/barcode scanner integration UI
- Stock level indicators with reorder alerts

**Modals & Overlays**:
- Full-screen overlay (bg-black/80)
- Modal centered, max-w-2xl, rounded-xl
- Header with title + close button (X icon)
- Footer with action buttons (cancel left, primary right)
- Slide-out panels from right for detailed views (w-1/2)

**Notifications & Alerts**:
- Toast notifications (top-right, w-96)
- Priority levels: Info, Warning, Critical with distinct visual treatment
- Dismissible with X icon
- Auto-dismiss timer for non-critical
- Alert banner across top for system-wide announcements

**Icons**: Heroicons exclusively via CDN - use outline for navigation, solid for status indicators

## Images Specification

**Hero Background Image**:
- Location: Dashboard landing page header
- Description: High-resolution tactical operations center interior or military command room with screens/maps, dramatic lighting, slightly desaturated
- Treatment: Dark overlay (bg-black/60), slightly blurred (blur-sm on image layer)
- Dimensions: Full-width, height 18rem (h-72)

**User Avatars**:
- Placeholder for profile photos throughout
- Default: Initials in circular badge with tactical color background
- Size: 40px standard, 64px for profile pages

**Asset Thumbnails**:
- Equipment/vehicle images in inventory cards
- Size: 80x80px, rounded corners
- Fallback: Icon representation for missing images

**Empty States**:
- Illustration placeholders for zero-data scenarios
- Tactical/minimalist style icons at 120x120px

This system balances military precision with modern interface patterns, ensuring information density without overwhelming users while maintaining tactical aesthetic authority.