# SabApplier AI (Monorepo)

This project is a Monorepo containing independent Backend and Website applications.

## Directory Structure

```text
/
├── apps/
│   ├── backend/   (Genkit AI Server - Port 4000)
│   └── website/   (Next.js Frontend - Port 3000)
├── package.json   (Root Workspace Config)
```

## Setup

1.  **Install Dependencies** (from root):
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    -   Create `.env` in `apps/backend/` (needs `GOOGLE_GENAI_API_KEY`).
    -   Create `.env` in `apps/website/` (needs Firebase Config).

## Running the App

You need to run **two terminal windows**:

**Terminal 1: Backend (AI Server)**
```bash
npm run dev:backend
# Starts Genkit flow on http://localhost:4000
```

**Terminal 2: Website (Frontend)**
```bash
npm run dev:website
# Starts Next.js on http://localhost:3000
```
