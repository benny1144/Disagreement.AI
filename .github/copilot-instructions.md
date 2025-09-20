# Disagreement AI Coding Instructions

This document provides guidance for AI coding agents working on the Disagreement AI codebase.

## Architecture

This is a MERN stack application with a client-server architecture.

*   **`client/`**: A React application built with Vite.
    *   The main entry point is `client/src/main.jsx`.
    *   The root component is `client/src/App.jsx`.
    *   Styling is done with CSS, likely with Tailwind CSS given the `tailwind.config.js`.
*   **`server/`**: A Node.js/Express.js application.
    *   The main entry point is `server/index.js`.
    *   It uses a Model-Controller-Route pattern:
        *   **`server/models/`**: Mongoose schemas for database models (e.g., `User.js`, `Disagreement.js`).
        *   **`server/controllers/`**: Business logic for handling API requests.
        *   **`server/routes/`**: API endpoint definitions.
    *   **Authentication**: Implemented using JSON Web Tokens (JWT). See `server/middleware/authMiddleware.js`.
    *   **Real-time Features**: Uses `socket.io` for real-time communication.
    *   **External Services**: Integrates with AWS S3 for file storage and the OpenAI API.

## Developer Workflows

### Client

To run the client development server:

```bash
cd client
npm install
npm run dev
```

To build the client for production:

```bash
cd client
npm run build
```

### Server

To run the server development server (with auto-reloading):

```bash
cd server
npm install
npm run dev
```

To start the server for production:

```bash
cd server
npm start
```

## Key Files and Directories

*   `client/src/App.jsx`: The main React component.
*   `server/server.js`: The core Express server setup.
*   `server/routes/disagreementRoutes.js`: API routes related to disagreements.
*   `server/controllers/disagreementController.js`: Logic for handling disagreement-related requests.
*   `server/models/Disagreement.js`: The Mongoose model for disagreements.
*   `server/middleware/authMiddleware.js`: JWT authentication middleware.

## Conventions

*   The backend follows a typical MVC-like structure. When adding new features, create or update the model, controller, and route files accordingly.
*   API routes are versioned or grouped under `/api`. For example, user routes are under `/api/users`.
*   React components are written in JSX.
