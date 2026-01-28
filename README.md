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
    -   Create a file named `.env` in the root of the project.
    -   Add your Supabase project credentials to this file. You can find these in your Supabase project's "Settings" > "API" section.
    ```env
    VITE_SUPABASE_URL=your-supabase-project-url
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

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
