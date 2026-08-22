# UrbanEco-Link — Mobile Design System

This design system is derived directly from the canonical `web-app/` implementation. It establishes the visual identity, UI tokens, component specs, typography, colors, and layout rules for the `mobile-ui/` Flutter application.

---

## 1. Primary & Neutral Color Palette

| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `primary` | `#16A34A` | Brand Green, Primary Buttons, Active States, Main Icons |
| `primary-light` | `#DCFCE7` | Highlight Backdrops, Soft Badges, Active Tab Backgrounds |
| `primary-dark` | `#14532D` | Dark Text Accents, Deep Headers, High-contrast Badges |
| `neutral-dark` | `#111827` | Headings, Primary Body Text, High Emphasis Labels |
| `neutral-gray` | `#6B7280` | Subtitles, Secondary Text, Borders, Unselected Nav Icons |
| `bg-slate-50` | `#F8FAFC` | Main Screen Background |
| `surface-white` | `#FFFFFF` | Card Surfaces, Bottom Sheets, Modals, Input Fields |
| `border-gray` | `#E2E8F0` | Subtle Card Borders, Input Outlines, Dividers |

### Decorative Accents
- **Hero Gradient**: `LinearGradient(colors: [Color(0xFF10B981), Color(0xFF14B8A6), Color(0xFF16A34A)])` (Emerald to Teal to Green)
- **Primary Glow / Ring**: `Color(0x1A16A34A)` (Emerald with 10% opacity)

---

## 2. Waste Stream Colors

| Stream Category | Hex Code | Background Hex | Label / Icons |
| :--- | :--- | :--- | :--- |
| **WET (Organic)** | `#16A34A` | `#DCFCE7` | Organic Kitchen & Food Waste |
| **DRY (Recyclables)** | `#2563EB` | `#DBEAFE` | Plastics, Paper, Cardboard, Metals |
| **HAZARDOUS / E-WASTE** | `#DC2626` | `#FEE2E2` | Electronics, Batteries, Chemicals |
| **SANITARY** | `#D97706` | `#FEF3C7` | Hygiene & Bio-medical items |

---

## 3. Factory Operational Status Colors

| Factory Status | Color Code | Background | Behavior / System Rule |
| :--- | :--- | :--- | :--- |
| **Operational** | `#16A34A` | `#DCFCE7` | Accepting waste normally |
| **Busy** | `#D97706` | `#FEF3C7` | Accepting waste with potential queue delay |
| **Limited Capacity** | `#EAB308` | `#FEF9C3` | Accepting only high-priority stream allocations |
| **Full Capacity** | `#DC2626` | `#FEE2E2` | Do not assign new batches |
| **Under Maintenance** | `#DC2626` | `#FEE2E2` | Do not assign. Requires Start & Recovery time |
| **Emergency Shutdown** | `#991B1B` | `#FEE2E2` | Stop all intake immediately. Banner alert visible |

---

## 4. Typography System (Google Inter)

| Scale | Style / Weight | Size (sp) | Usage |
| :--- | :--- | :--- | :--- |
| `Display Title` | Bold / Black (800-900) | 28 - 32 | App Brand Header, Hero Headers |
| `Title 1` | Extra Bold (800) | 22 - 24 | Screen Titles, Section Headers |
| `Title 2` | Bold (700) | 18 - 20 | Card Titles, Modal Headers |
| `Subtitle` | SemiBold (600) | 14 - 16 | Subsection Labels, Heavy Body |
| `Body` | Regular / Medium (400-500)| 14 - 15 | Main Paragraphs, Description |
| `Caption` | SemiBold (600) | 12 - 13 | Meta details, Subtext |
| `Badge Text` | Bold / Black (700-900) | 10 - 12 | Status Badges, Stream Tags |

---

## 5. Components & Tokens

### Cards
- **Background**: `#FFFFFF`
- **Border**: 1px `#F1F5F9` or `#E2E8F0`
- **Radius**: `16.0` to `24.0` (`BorderRadius.circular(16)`)
- **Shadow**: `BoxShadow(color: Color(0x0F000000), blurRadius: 12, offset: Offset(0, 4))`

### Buttons
- **Primary Pill Button**:
  - Background: `#16A34A` (Hover/Pressed `#14532D`)
  - Text: `#FFFFFF`, Bold 14sp
  - Radius: `30.0` or `16.0`
  - Height: `48.0` - `52.0`
- **Secondary / Outline Button**:
  - Background: `#FFFFFF`
  - Border: 1px `#E2E8F0`
  - Text: `#111827`, SemiBold 14sp
  - Radius: `16.0`
- **Danger / Emergency Button**:
  - Background: `#DC2626`
  - Text: `#FFFFFF`, Bold 14sp
  - Radius: `16.0`

### Input Fields
- **Background**: `#F8FAFC`
- **Border**: 1px `#E2E8F0` (Focused: 2px `#16A34A`)
- **Radius**: `14.0`
- **Content Padding**: `EdgeInsets.symmetric(horizontal: 16, vertical: 14)`
- **Icon Prefix**: 20px Lucide Icon in `#6B7280`

### Status Badges
- **Shape**: Rounded Pill (`BorderRadius.circular(20)`)
- **Padding**: `EdgeInsets.symmetric(horizontal: 10, vertical: 4)`
- **Typography**: Bold 11sp, uppercase / title case.

---

## 6. Mobile Layout & Navigation Guidelines

- **Bottom Navigation Bar**: Fixed at bottom with active indicator in `#16A34A`.
- **Touch Target Minimum**: 44px x 44px for all buttons and interactive items.
- **Screen Padding**: 16px to 20px horizontal padding on all screens.
- **Scroll Behavior**: Smooth, bounce-enabled scrolling using `BouncingScrollPhysics`.
- **Responsive Widths Supported**: 320px (Compact), 375px (Standard), 390px / 414px (Large).

---

## 7. State Handling Standards

- **Loading**: Pulse shimmer or clean emerald activity indicator (`CircularProgressIndicator(color: AppColors.primary)`).
- **Empty State**: Centered icon + headline + descriptive copy + primary action button.
- **Error Banner**: Toast or top banner with `#FEE2E2` background, `#DC2626` border/text, and retry action.
- **Offline / Connectivity**: Offline notice bar at top of screen with manual refresh trigger.
