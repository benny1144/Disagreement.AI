# Spec: Reusable Public Header Component

## 1. Objective
Create a responsive, reusable header component for all public-facing pages of the application.

## 2. File Location
`client/src/components/layout/PublicHeader.jsx`

## 3. Core Components
* **Logo:** The official logo is text-based.
    * **Exact String:** "Disagreement.AI"
    * **Styling:** The "agreement" portion must be rendered in the primary blue color (`#2667FF`).
    * **Link Target:** It must link to the root path (`/`).
* **Action Buttons:**
    * **Login Button:** Label is "Login" and it links to `/login`. Use a secondary/subtle style.
    * **Sign Up Button:** Label is "Sign Up" and it links to `/register`. Use a primary, solid background style.

## 4. Responsive & Mobile Behavior
* On mobile screens, the buttons will be replaced by a hamburger menu icon.
* When clicked, the hamburger icon will toggle a slide-down panel from below the header containing the "Login" and "Sign Up" links stacked vertically.
* The panel should open and close with a gentle `ease-in-out` transition.

## 5. Styling & Dimensions
* **Height:** Use a fixed height (e.g., Tailwind's `h-16`).
* **Background:** Use a solid, light background (e.g., `bg-white`).
* **Border:** Add a subtle bottom border for separation (e.g., `border-b border-slate-200`).
* **Position:** The header must be `sticky` at the top of the viewport.

## 6. Accessibility
* The hamburger button must use `aria-expanded` and `aria-controls`.
* Pressing the `Escape` key must close the mobile menu.
* When the mobile menu opens, keyboard focus must move to the first link inside it.