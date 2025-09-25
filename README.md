# Disagreement.AI

Disagreement.AI is a platform designed to facilitate constructive disagreements and debates. This is a MERN stack application featuring a React frontend and a Node.js/Express backend.

## Architecture

*   **`client/`**: A React single-page application built with Vite.
*   **`server/`**: A Node.js/Express.js API server that connects to MongoDB.

## Getting Started

### Prerequisites

*   Node.js and npm
*   MongoDB
*   Git

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd Disagreement.AI
    ```

2.  **Setup the Server:**
    ```sh
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory by copying the example:
    ```sh
    cp .env.example .env
    ```
    Update the `.env` file with your credentials (MongoDB URI, JWT Secret, etc.).

3.  **Setup the Client:**
    ```sh
    cd ../client
    npm install
    ```

### Running the Application

*   **Run the server (development mode):**
    ```sh
    cd server
    npm run dev
    ```

*   **Run the client (development mode):**
    ```sh
    cd client
    npm run dev
    ```