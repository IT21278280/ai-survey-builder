# AI Survey Builder

AI Survey Builder is a full-stack Next.js application for creating, publishing, sharing, and analyzing surveys. The app combines a drag-and-drop builder, AI-assisted question generation, survey response collection, analytics dashboards, and CSV export for reporting.

## Project Overview

Key features:
- **Survey builder** with question editing, ordering, and publishing controls
- **AI generation** for survey questions and options
- **Public survey pages** for anonymous response collection
- **Survey owner dashboards** for response tracking and analytics
- **CSV export** of survey responses with question-aligned columns
- **Authentication** and protected dashboard routes
- **Prisma + PostgreSQL** data persistence with analytics support

## Architecture

The project uses the following architecture:
- **Next.js App Router** for server and client components
- **Prisma ORM** for database interactions via PostgreSQL
- **NextAuth** for authentication and session handling
- **Radix UI + Tailwind CSS** for accessible UI components and styling
- **Sonner** for toast notifications
- **@hello-pangea/dnd** for drag-and-drop builder ordering

## Repository Structure

- `src/app/` � application routes, pages, layouts
- `src/components/` � reusable UI components and feature modules
- `src/actions/` � server actions for surveys, responses, AI, and dropoff tracking
- `src/lib/` � shared utilities, database client, auth helper, validations
- `src/types/` � TypeScript domain definitions
- `prisma/` � database schema and migration files
- `public/` � static assets such as icons and images

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/database
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
```

3. Run Prisma migrations:

```bash
npx prisma migrate dev
```

4. Start development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Usage

- `GET /` � marketing home page
- `GET /login` � authentication entry point
- `GET /dashboard` � authenticated dashboard overview
- `GET /forms` � survey list and creation
- `GET /forms/[id]/edit` � builder editor
- `GET /forms/[id]/responses` � response viewer and export
- `GET /s/[surveyId]` � public survey form for respondents

## CSV Export Format

The CSV export is designed for readability and reporting:
- first columns for `Response ID`, `Submitted At`, `Total Answers`
- follow-up columns for each survey question in the original ordering
- each response row aligns answers to the question columns
- Excel-friendly UTF-8 BOM is included for compatibility

## Code Quality

This repository follows professional engineering standards:
- **Modular architecture** with feature-specific components and actions
- **Type-safe business logic** using TypeScript and Prisma models
- **Validation** via Zod schemas for survey and response data
- **Accessible UI** using Radix primitives and semantic HTML
- **Optimized rendering** with Next.js server and client boundaries
- **Explicit error handling** for missing surveys, rate limiting, and auth checks

## Recommended Git Workflow

A clean git workflow for this project should include:
- `feat:` commits for new features
- `fix:` commits for bug fixes
- `refactor:` for code restructuring without behavior changes
- `style:` for formatting or Tailwind class updates
- `docs:` for documentation changes
- `chore:` for dependency or configuration updates

## Deployment

For production deployment, use Vercel or a container-based environment.

On Vercel, connect the GitHub repository and configure environment variables. The app supports server-side rendering and API routes out of the box.

## Troubleshooting

- Ensure `DATABASE_URL` is valid and reachable
- Run `npx prisma generate` when schema changes
- Use `npm run lint` to catch styling and code issues
- Use `npm run build` to verify production readiness

## Contribution Guidelines

1. Create a new feature branch.
2. Write clear, focused commits.
3. Keep changes small and logically grouped.
4. Test routes and behavior locally.
5. Update documentation for new features.

# Screenshots

This folder contains UI screenshots captured during development. Each image is embedded below for quick preview on GitHub.

---

### Home Screen

<img src="./screenshots/Home%20Screen.jpeg" alt="Home Screen" width="900" />

---

### Dashboard

<img src="./screenshots/Dashboard%20screen.jpeg" alt="Dashboard Screen" width="900" />

---

### Login Screen (Continue with Google)

<img src="./screenshots/Login%20screen.jpeg" alt="Login Screen" width="600" />

---

### Create Form

<img src="./screenshots/Create%20Form%20screen.jpeg" alt="Create Form Screen" width="900" />

---

### AI Survey Generator

<img src="./screenshots/AI%20Survey%20Generator%20screen.jpeg" alt="AI Survey Generator Screen" width="900" />

---


```
