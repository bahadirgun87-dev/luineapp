# SaaS Checklist Builder

This is a simple, modern web application for building and managing checklists, created with the assistance of an AI software engineer, Jules.

## Tech Stack

- **Frontend:** React with TypeScript, built using Vite
- **Styling:** Tailwind CSS
- **Backend & Auth:** Supabase

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher is recommended)
- npm (comes with Node.js)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd saas-checklist-builder
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Copy the example environment file `.env.example` to a new file named `.env`.
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and add your Supabase project credentials. You can find these in your Supabase project's "Settings" > "API" section.

### Supabase Database Schema

**Important:** For the application to work correctly, your Supabase database must have the following structure:

-   A table named `checklists` with a column named `title` (type `text`).
-   A table named `tasks` with a column named `title` (type `text`).

The application code uses `title` to store the name of both checklists and tasks.

### Running the Development Server

Once the setup is complete, you can run the local development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Building for Production

To create a production-ready build of the application, run:

```bash
npm run build
```

This will generate a `dist` folder with the optimized and minified assets, ready for deployment.
