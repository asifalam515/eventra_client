# Eventra Client

## Project Description

Eventra Client is a modern event discovery and event management frontend built with Next.js App Router. It provides public event browsing, event details, authentication flows, and role-based dashboard experiences for admin, moderator, and user roles.

## Live URLs

- Frontend (Vercel): https://eventra-client.vercel.app/
- Backend API: https://eventraserver.vercel.app
- Local Frontend: http://localhost:3000
- Local Backend: http://localhost:5000/api/v1

## Features

- Public event listing with search and filtering
- Event detail pages with resilient data handling
- User authentication (login/signup) with server actions
- Role-based dashboard routing for admin, moderator, and user
- Event actions: create, edit, join, invite, review, and participation management
- Reusable component-driven UI built with Radix and shadcn-style patterns

## Technologies Used

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Radix UI primitives
- Framer Motion
- Lucide React icons
- class-variance-authority, clsx, and tailwind-merge

## Setup Instructions

1. Prerequisites:

- Node.js 20+
- npm
- Running Eventra backend API

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (recommended in `.env.local`):

```env
NEXT_PUBLIC_BASE_URL=https://eventraserver.vercel.app
NEXT_PUBLIC_API_URL=https://eventraserver.vercel.app/api/v1
```

4. Run the development server:

```bash
npm run dev
```

5. Open the app:

http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format files with Prettier
- `npm run typecheck` - Run TypeScript checks
