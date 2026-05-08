# Design System Document

### Name: Estate Sovereign Design System

## 1. Overview & Creative North Star: "The Financial Curator"

This design system is engineered to distance the El-Moore Real Estate experience from the cluttered, transactional nature of standard property portals. We are not building a listing site; we are crafting a private investment dashboard.

**Creative North Star: The Financial Curator**
The aesthetic is rooted in the high-end editorial world of private banking and architectural journals. It prioritizes white space as a luxury commodity, uses intentional asymmetry to guide the eye through complex financial data, and employs a "layered paper" philosophy. The interface should feel as though information is being presented on heavy-stock vellum, curated specifically for a high-net-worth individual. We break the grid through overlapping elements—where imagery slightly bleeds over container boundaries—to create a sense of bespoke, hand-crafted digital architecture.

---

## 2. Colors: Depth Through Tonal Sophistication

The palette moves beyond simple branding into a functional hierarchy of investment authority.

### The Palette

- **Primary (`#142C26` / `primary_container`):** Deep Forest Green. This is our "anchor" color, representing growth, stability, and institutional trust.
- **Secondary (`#CDBF8A` / `secondary_fixed_dim`):** Champagne Gold. Used exclusively for highlights, success metrics, and "premium" interactions.
- **Surface (`#FAF9F5` / `surface`):** A warm, off-white "fine paper" base that prevents the clinical coldness of pure `#FFFFFF`.

### The "No-Line" Rule

**Borders are prohibited for sectioning.** To define the boundaries of the "Showroom" or "The Vault," designers must use background shifts.

- Place a `surface_container_low` card on a `surface` background.
- Use `surface_container_highest` for sidebars to create a natural, architectural indentation.

### Glass & Signature Textures

For floating investment calculators or "Real-Time Consultation" widgets, use **Glassmorphism**. Combine `surface_lowest` at 70% opacity with a `24px` backdrop blur.

- **Signature Gradient:** For primary CTAs (e.g., "Calculate Projected ROI"), use a subtle linear gradient from `primary` (#001712) to `primary_container` (#142C26) at a 135-degree angle. This adds a "weighted" feel that flat colors lack.

---

## 3. Typography: Editorial Authority

We use a dual-font strategy to balance modern geometric precision with readability.

- **Display & Headlines (Manrope):** Chosen for its modern, expansive feel. `display-lg` (3.5rem) should be used for hero ROI figures and property titles. The tight tracking and large scale convey "Institutional Power."
- **Body & Titles (Work Sans):** A highly legible, geometric sans-serif that echoes the Axiforma brand requirement. It provides a clean, "no-nonsense" atmosphere for financial data and property specifications.
- **The Hierarchy:**
  - **Captions/Labels:** Use `label-md` in `secondary` (Gold) for "Investment Type" tags to ensure they feel like premium markers, not just metadata.
  - **Body:** Keep `body-md` generous in line-height (1.6) to ensure the financial guides in the "Academy" section feel approachable.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "software-standard." In this system, depth is organic.

- **The Layering Principle:** Stacking `surface_container` tiers creates a natural lift.
  - _Base:_ `surface`
  - _Section:_ `surface_container_low`
  - _Active Card:_ `surface_container_lowest` (White)
- **Ambient Shadows:** If a card must float (e.g., a "Buy-to-Sell" ROI card), use a shadow tinted with the `on_surface` color: `rgba(27, 28, 26, 0.06)` with a `40px` blur and `12px` Y-offset.
- **The "Ghost Border" Fallback:** For input fields or cards that require containment on identical background colors, use a 1px border of `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components: The Investor's Toolkit

### Buttons: High-Stakes Interaction

- **Primary:** Gradient of `primary` to `primary_container`. `0.25rem` (sm) roundedness for a sharp, professional edge.
- **Secondary:** Ghost style. No background, `outline` border (20% opacity), text in `primary`.

### Cards & Lists: No Dividers

- **Investment Cards:** Forbid horizontal lines. Use `1.7rem` (`spacing-5`) of vertical whitespace to separate "Property Type" from "Facilities."
- **Property Lists:** Separate items by alternating between `surface` and `surface_container_low` backgrounds.

### Specialized Components

- **ROI Toggle:** A custom toggle using `secondary` (Gold) for the "Buy-to-Let" vs "Buy-to-Sell" switch. The active state should have a soft `secondary_container` glow.
- **The "Vault" Folder:** A specialized container for land titles and sensitive documents using a `surface_bright` background and a `secondary` left-accent border (4px) to denote importance.
- **Metric Chips:** Small, `0.125rem` rounded chips using `primary_fixed` backgrounds with `on_primary_fixed` text for data points like "C of O Available."

---

## 6. Do’s and Don'ts

### Do:

- **Do** overlap the El-Moore architectural logo mark slightly over the edge of hero images to create depth.
- **Do** use asymmetrical layouts. For example, left-align the property description while right-aligning the ROI calculation in a separate, elevated container.
- **Do** use `secondary_fixed_dim` (Gold) for the most critical "Success" metrics (Total Profit, Yield).

### Don't:

- **Don't** use 100% opaque black for text. Use `on_surface` (#1B1C1A) to maintain a high-end, softened contrast.
- **Don't** use "Standard" icons. Use thin-stroke, custom SVG icons that match the weight of the Work Sans typography.
- **Don't** use large corner radii. This system is "financial-focused"; keep roundedness to `sm` (0.125rem) or `md` (0.375rem) to maintain a serious, structured tone.
- **Don't** use divider lines to separate list items in the "Showroom." Use the Spacing Scale `spacing-4` (1.4rem) to create separation through "breathing room."
