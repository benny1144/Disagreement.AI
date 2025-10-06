# Specification: Environment Variable Setup
- **ID:** `spec.env.setup`
- **Version:** 1.0
- **Date:** October 5, 2025
- **Author:** Gemini, Project Architect

## 1.0 Document Purpose
This document defines all necessary environment variables for the Disagreement.AI application. It serves as the single source of truth for configuring the backend (FastAPI), frontend (Next.js), and connections to third-party services like PostgreSQL, SMTP, n8n, and AI model providers. This specification will be used to create the local `.env` file for development and the `.env.example` file for repository tracking.

## 2.0 Security Mandate
The `.env` file will contain sensitive credentials. It **MUST** be included in the project's `.gitignore` file and must **NEVER** be committed to version control. The `.env.example` file, which contains variable names but no secret values, is safe to commit.

## 3.0 Environment Variable Definitions

### 3.1 Backend (FastAPI) Configuration
These variables control the core behavior and security of the Python backend.

- `SECRET_KEY`: A long, random string used for signing JWTs and other security functions.
- `ALGORITHM`: The algorithm for JWT encoding. Default: `HS256`.
- `ACCESS_TOKEN_EXPIRE_MINUTES`: The lifespan of a user's access token. Default: `30`.

### 3.2 Database Configuration (PostgreSQL)
This variable provides the backend with the credentials to connect to the PostgreSQL database.

- `DATABASE_URL`: The full connection string for the database. Format: `postgresql://USER:PASSWORD@HOST:PORT/DBNAME`.

### 3.3 Email (SMTP) Configuration
These variables are required for the application to send transactional emails directly (e.g., password resets).

- `SMTP_SERVER`: The address of the SMTP mail server.
- `SMTP_PORT`: The port for the SMTP server (e.g., 587 for TLS).
- `SMTP_USERNAME`: The username for SMTP authentication.
- `SMTP_PASSWORD`: The password or app-specific token for the SMTP user.
- `EMAILS_FROM_EMAIL`: The email address that will appear in the "From" field.

### 3.4 n8n Webhook Triggers
These are the specific URLs the backend will call to trigger our n8n automation workflows.

- `N8N_WEBHOOK_URL_USER_REGISTRATION`: Triggers the new user welcome email sequence.
- `N8N_WEBHOOK_URL_INVITE_PARTICIPANT`: Triggers the "You've been invited" email.

### 3.5 AI Service Keys (CrewAI)
These API keys are required for CrewAI agents to access underlying Large Language Models (LLMs) and tools.

- `OPENAI_API_KEY`: API key for OpenAI services.
- `GROQ_API_KEY`: API key for Groq services (for high-speed inference).
- `SERPER_API_KEY`: API key for Serper for real-time search capabilities within agents.

### 3.6 Frontend (Next.js) Configuration
This variable tells the React frontend where to find the backend API.

- `NEXT_PUBLIC_API_URL`: The full URL of the running FastAPI backend (e.g., `http://127.0.0.1:8000`). The `NEXT_PUBLIC_` prefix is mandatory for it to be accessible in the browser.

## 4.0 Environment Variable Template
This section should be copied directly into the `.env` file.

```env
# =======================================
# BACKEND (FastAPI) CONFIGURATION
# =======================================
SECRET_KEY=your_super_secret_random_string_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# =======================================
# DATABASE CONFIGURATION (PostgreSQL)
# =======================================
DATABASE_URL=postgresql://postgres:your_db_password@localhost:5432/disagreement_ai

# =======================================
# EMAIL (SMTP) CONFIGURATION
# =======================================
SMTP_SERVER=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=user@example.com
SMTP_PASSWORD=your_smtp_password
EMAILS_FROM_EMAIL=noreply@disagreement.ai

# =======================================
# N8N WEBHOOK TRIGGERS
# =======================================
N8N_WEBHOOK_URL_USER_REGISTRATION=your_n8n_registration_webhook_url
N8N_WEBHOOK_URL_INVITE_PARTICIPANT=your_n8n_invite_webhook_url

# =======================================
# AI SERVICE KEYS (CREWAI)
# =======================================
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
SERPER_API_KEY=your_serper_api_key

# =======================================
# FRONTEND (Next.js) CONFIGURATION
# =======================================
NEXT_PUBLIC_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)