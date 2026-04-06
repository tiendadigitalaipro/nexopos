# Design System Specification: The Architectural POS & ERP Framework

## 1. Overview & Creative North Star
**Creative North Star: "The Precision Architect"**

In the demanding environment of high-volume retail and enterprise resource planning, "standard" UI creates cognitive friction. This design system moves away from the traditional, cluttered dashboard towards a "Precision Architect" aesthetic. It prioritizes clarity through extreme intentionality—utilizing expansive breathing room, sophisticated tonal layering, and an editorial typographic approach that treats inventory data as high-end content.

By breaking the rigid "box-and-line" template common in legacy POS systems, we employ an asymmetrical balance where high-action zones are weighted with deep professional blues, and status-driven zones utilize success-oriented greens. The result is a signature interface that feels authoritative, premium, and unfailingly reliable.

---

## 2. Colors: Tonal Depth & The No-Line Rule

The palette is engineered for high contrast and immediate recognition. We utilize a hierarchy of blues to signify "Trust & Stability" and greens for "Success & Momentum."

### Palette Strategy
- **Primary (`#00458f`)**: Used for the "Command Center"—main navigation and primary POS actions.
- **Secondary (`#006c47`)**: Reserved for growth and success metrics (e.g., daily sales totals, stock replenishment success).
- **Tertiary (`#653e00`)**: Used for attention-grabbing but non-critical administrative tasks.

### The "No-Line" Rule
To achieve a premium editorial feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts:
- A `surface-container-low` (`#eff4ff`) card sitting on a `surface` (`#f8f9ff`) background provides sufficient contrast without the "visual noise" of a border.
- **Surface Hierarchy & Nesting:** Use `surface-container-lowest` (`#ffffff`) for the most critical interactive elements (like the active checkout card) to create a natural "pop" against the lower-tier containers.

### The "Glass & Gradient" Rule
For floating POS elements (like a "Current Total" overlay), use **Glassmorphism**:
- Apply a semi-transparent `surface` color with a 20px backdrop-blur. 
- **Signature Textures:** Main CTAs should utilize a subtle linear gradient from `primary` (`#00458f`) to `primary_container` (`#005cbb`) at a 135-degree angle to provide a tactile, "clickable" soul to the button.

---

## 3. Typography: Editorial Authority

We use **Inter** as our single source of truth. Its geometric precision ensures legibility on low-resolution POS monitors while maintaining a modern edge on high-density tablets.

- **Display & Headline Scale:** Large-scale headings (e.g., `display-lg` at 3.5rem) should be used for critical real-time data like "Total Amount Due" to provide immediate visual hierarchy.
- **Title & Body Scale:** `title-lg` (1.375rem) is used for product names in the grid, while `body-md` (0.875rem) handles the dense ERP data tables.
- **Labeling:** `label-sm` (0.6875rem) should always be in Uppercase with a 5% letter-spacing to distinguish metadata from actionable text.

---

## 4. Elevation & Depth: Tonal Stacking

Traditional shadows are replaced with **Ambient Layering**. Depth is achieved by "stacking" the surface-container tiers.

- **The Layering Principle:** Place a `surface_container_highest` (`#d5e3fc`) sidebar next to a `surface` (`#f8f9ff`) main content area to define the workspace.
- **Ambient Shadows:** When an element must float (e.g., a modal or a floating action button), use a 32px blur with 6% opacity, using the `on_surface` color (`#0d1c2e`) as the shadow tint. This mimics natural light rather than digital "glow."
- **The Ghost Border Fallback:** If a divider is functionally required in a dense inventory table, use the `outline_variant` token at **15% opacity**. This provides a guide for the eye without creating a visual cage.

---

## 5. Components: Touch-First Professionalism

### Buttons & Touch Targets
- **Primary Action:** 135-degree gradient (`primary` to `primary_container`), `xl` (0.75rem) roundedness. Minimum height of 56px for tablet interaction.
- **Product Tiles:** Use `surface_container_low` as the base. Large `headline-sm` text for pricing.

### Data Tables & Inventory
- **The "No-Divider" Card:** Forbid the use of horizontal lines between rows. Use a 12px vertical spacing (Gap) and alternating `surface_container_low` and `surface_container_lowest` backgrounds for row distinction.
- **Stock Indicators:** Use a `secondary_container` (`#8af5be`) pill with `on_secondary_container` (`#00714b`) text for "In Stock." Use `error_container` for "Low Stock."

### POS Category Grid
- **Vibrant Categories:** Use high-saturation backgrounds for product categories to allow for peripheral-vision navigation. Ensure text remains `on_surface` for maximum contrast.

### Input Fields
- **Floating Labels:** Always use `surface_container_lowest` for the input background to contrast against the `surface`. The focus state must use a 2px `primary` "Ghost Border" at 40% opacity.

---

## 6. Do's and Don'ts

### Do
- **Do** use `surface_bright` to highlight active ERP modules.
- **Do** allow elements to overlap slightly (e.g., a search bar overlapping a table header) to create architectural depth.
- **Do** use large `display-sm` type for the final checkout price—this is the most important "moment" in the POS flow.

### Don't
- **Don't** use 100% black text. Always use `on_surface` (`#0d1c2e`) for a softer, more professional high-contrast look.
- **Don't** use `none` roundedness unless for full-bleed background sections. Always use at least `DEFAULT` (0.25rem) to maintain a modern, approachable feel.
- **Don't** use standard shadows. If a shadow feels "visible," it is too heavy. It should feel like a "lift" in the paper, not a dark smudge.