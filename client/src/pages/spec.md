# spec.md: Dashboard UI Refactor - Bento Grid

## 1.0 Feature Overview
This document specifies the refactoring of the main user Dashboard from its current layout to a modern "Bento Grid" layout.

## 2.0 Strategic Objective
To enhance the user experience by creating a more scannable, organized, and visually engaging home base for the user. This aligns with the "Apple-Inspired Trust & Clarity" design system and the "De-escalation by Design" principle from the `Disagreement.AI MVP` document.

## 3.0 Core Layout Requirements
-   **Component:** `Dashboard.jsx` (or the primary dashboard component file).
-   **Framework:** Chakra UI.
-   **Layout:** The primary container should use `Grid` and `GridItem` components from Chakra UI.
-   **Responsiveness:**
    -   On desktop devices (e.g., > 768px), the grid should be a 2x2 layout.
    -   On mobile devices (e.g., < 768px), the grid items should stack vertically into a single column.

## 4.0 Bento Box Contents & Specifications

### Box 1: "My Active Disagreements"
-   **Grid Area:** Should occupy a larger portion of the grid if possible (e.g., 2 columns wide on desktop).
-   **Content:**
    -   A clear heading: `h2` "Active Disagreements".
    -   A scrollable list (`Box` with `overflowY='auto'`) of the user's active cases.
    -   Each list item should display the disagreement's `title` and the `participants`.
-   **Empty State:** If the user has no active disagreements, this box must display a clear, friendly message (e.g., "You have no active disagreements. Create one to get started!") and an icon.

### Box 2: "Create New Disagreement"
-   **Grid Area:** A standard 1x1 box.
-   **Content:** This should be a high-contrast, visually distinct "Call to Action" card.
    -   A prominent `+` icon.
    -   A clear `h3` heading: "New Disagreement".
    -   A short description: "Start a new resolution process."
    -   The entire card should be a clickable element that triggers the "Create New Disagreement" modal/flow.

### Box 3: "Resolution Analytics"
-   **Grid Area:** A standard 1x1 box.
-   **Content:** A simple statistics card.
    -   A heading: `h3` "My Stats".
    -   Display two key metrics with large, clear numbers:
        -   "Cases Resolved": A static number for now (e.g., "0").
        -   "Success Rate": A static percentage for now (e.g., "N/A").

### Box 4: "Recent Activity"
-   **Grid Area:** A standard 1x1 box, likely spanning 2 columns on the bottom row.
-   **Content:** A placeholder for future activity feeds.
    -   A heading: `h3` "Recent Activity".
    -   For the MVP, this can contain a simple message: "Activity feed coming soon."

## 5.0 Styling
-   All grid items should have consistent padding, rounded corners (`borderRadius`), and a subtle `boxShadow` to lift them off the page.
-   Font styles must adhere to the project's Chakra UI theme (using the Nunito font).
-   Adhere to the project's color palette (`Primary Blue: #5D5FEF`, etc.).-   Ensure that the grid layout is responsive and adapts to different screen sizes, maintaining the 2x2 layout on desktop and stacking vertically on mobile.