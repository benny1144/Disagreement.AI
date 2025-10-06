# spec.md: In-App Onboarding Modal

## 1.0 Feature Overview
This document specifies a simple, one-time onboarding modal that explains the core 3-step resolution process to new users. This is a requirement from the `Disagreement.AI MVP` document.

## 2.0 Strategic Objective
To quickly educate first-time users, set clear expectations about the process, and increase the probability of successful engagement with the platform.

## 3.0 Triggering Logic
-   The modal should appear automatically immediately after a new user logs in for the first time and lands on the Dashboard.
-   This requires a new boolean flag in the User model in the database, such as `hasCompletedOnboarding`, which defaults to `false`.
-   The frontend will fetch the user's status. If `hasCompletedOnboarding` is `false`, the modal is displayed.

## 4.0 Component & Content Requirements (Chakra UI)

-   **Component:** Use the Chakra UI `Modal` component as the base.
-   **Structure:** The modal body should use a simple, multi-step format. A `Tabs` component is ideal for this.
-   **Modal Title:** "Welcome to Disagreement.AI"

### Step 1: "State Your Case"
-   **Icon:** A simple "document" or "edit" icon.
-   **Heading:** `h3` "1. State Your Case"
-   **Body Text:** "Clearly explain your side of the story. Provide all the relevant facts and evidence to build your case."

### Step 2: "AI Analyzes"
-   **Icon:** A "magic wand" or "search" icon.
-   **Heading:** `h3` "2. AI Analyzes"
-   **Body Text:** "Our impartial AI analyzes the conversation, identifies key points of agreement and disagreement, and may ask clarifying questions."

### Step 3: "Reach Agreement"
-   **Icon:** A "handshake" or "check mark" icon.
-   **Heading:** `h3` "3. Reach Agreement"
-   **Body Text:** "The AI drafts a neutral summary and a proposed resolution to help all parties find common ground and formally agree."

## 5.0 Actions & Backend Interaction
-   **Primary Action:** A single, prominent "Get Started" `Button` should be visible at the bottom of the modal.
-   **On Click:** When the user clicks "Get Started":
    1.  The modal must close.
    2.  An API call must be made to a backend endpoint (e.g., `PATCH /api/users/me/onboarding-complete`).
    3.  This endpoint must update the user's `hasCompletedOnboarding` flag to `true` in the database. This ensures the modal will never be shown to this user again.