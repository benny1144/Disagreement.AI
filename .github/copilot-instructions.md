# Disagreement AI Coding Instructions

This document provides guidance for AI coding agents working on the Disagreement AI codebase.

## Architecture

This is a monorepo-style project with a separate client and server.

*   **`client/`**: A Next.js application using the App Router.
    *   The main entry point is `client/src/app/layout.tsx`.
    *   Routing is handled by directories within `client/src/app/`.
    *   Styling is done with Tailwind CSS.
*   **`server/`**: A Node.js/Express.js application.
    *   The main entry point is `server/index.js`.
    *   It uses a Model-Controller-Route pattern.
    *   Authentication is implemented using JSON Web Tokens (JWT).

## Developer Workflows

### Client (Next.js)

To run the client development server:

```bash
cd client
npm install
npm run dev
```

### Server (Express)

To run the server development server (with auto-reloading):

```bash
cd server
npm install
npm run dev
```

## Key Files and Directories

*   `client/src/app/layout.tsx`: The root layout for the Next.js app.
*   `client/src/app/page.tsx`: The home page.
*   `server/index.js`: The core Express server setup.
*   `server/routes/disagreementRoutes.js`: API routes related to disagreements.
*   `server/controllers/disagreementController.js`: Logic for handling disagreement-related requests.
*   `server/middleware/authMiddleware.js`: JWT authentication middleware.
