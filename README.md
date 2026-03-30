# Eventra Client

Eventra Client is a modern event discovery and management frontend built with Next.js App Router, React 19, TypeScript, Tailwind CSS v4, and shadcn-style UI primitives. It provides a public browsing experience for events, detailed event pages, authentication UI, and role-based dashboard route structure.

## Highlights

- Event listing page with advanced client-side filtering
- Filters for search, event status, event type, and fee range
- Pagination with fixed page size (5 events per page)
- Event detail page with graceful API fallback strategy
- Polished login page and reusable login form with server action integration
- Role-based dashboard route groups for admin, moderator, and user
- Custom not found experience and reusable UI component library

## Tech Stack

- Framework: Next.js 16 (App Router)
- Runtime: React 19
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS v4 + tw-animate-css
- UI utilities: class-variance-authority, clsx, tailwind-merge
- Icons: lucide-react
- Motion: framer-motion
- Component patterns: Radix UI primitives + shadcn architecture

## Project Structure

```text
app/
	(CommonLayout)/
		page.tsx
		events/
			page.tsx
			events-browser.tsx
			[id]/page.tsx
		login/page.tsx
	(DashboardLayout)/
		dashboard/
			@admin/(adminDashboard)/admin-dashboard/page.tsx
			@moderator/(moderatorDashboard)/moderator-dashboard/page.tsx
			@user/(userDashboard)/user-dashboard/page.tsx
	not-found.tsx

components/
	CommoneComponents/
		Auth/loginForm.tsx
	ui/
		event-card.tsx
		button.tsx
		input.tsx
		...

actions/
	auth.ts
```

## Features in Detail

### Event Listing

- Data fetched server-side from the events API
- Interactive filtering in the browser:
  - Text search (name and description)
  - Status filter (upcoming, ongoing, completed)
  - Type filter (dynamic list from available event data)
  - Dual-handle fee range filter
- Pagination with Previous and Next controls

### Event Details

- Route: events by id
- Attempts detail endpoint first
- Falls back to list endpoint lookup when needed
- Handles inconsistent payloads (id vs \_id, name vs title, venue vs location)
- Includes event metadata cards: date, time, venue, fee, attendees, and rating

### Authentication UI

- Reusable login form component
- Email and password submission through server action
- Pending state for submit button
- Password visibility toggle

## Backend Integration

The client currently calls the following API endpoints directly:

- GET http://localhost:5000/api/v1/events
- GET http://localhost:5000/api/v1/events/:id

Important:

- Ensure your backend server is running on port 5000 before starting the frontend.
- If your backend URL changes, update the fetch URLs in the event pages.

## Getting Started

### 1) Prerequisites

- Node.js 20 or newer
- npm (or compatible package manager)
- Running Eventra backend API

### 2) Install Dependencies

```bash
npm install
```

### 3) Run Development Server

```bash
npm run dev
```

Open the app in your browser at:

```text
http://localhost:3000
```

## Available Scripts

- npm run dev: Start development server with Turbopack
- npm run build: Build production bundle
- npm run start: Run production server
- npm run lint: Run ESLint
- npm run format: Format TypeScript files with Prettier
- npm run typecheck: Run TypeScript type checking

## Route Map

- / : Home page
- /events : Event listing with filters and pagination
- /events/[id] : Event details
- /login : Login page
- /dashboard : Dashboard entry

Dashboard role slots:

- /dashboard/@admin
- /dashboard/@moderator
- /dashboard/@user

## Development Notes

- Path alias is enabled:
  - @/\* maps to project root
- TypeScript runs in strict mode
- UI components are colocated under the components directory
- The codebase uses server components by default, with client components for interactive UI

## Quality Checklist

Before opening a pull request, run:

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment

This project can be deployed to any platform that supports Next.js, such as Vercel, Netlify, or a custom Node.js environment.

For production:

- Confirm backend base URL configuration
- Run production build
- Serve with npm run start

## Contributing

1. Create a feature branch
2. Make focused changes with clear commit messages
3. Run lint, typecheck, and build locally
4. Open a pull request with summary, screenshots, and testing notes

## License

No license file is currently included in this repository. Add a LICENSE file if you plan to distribute this project.
