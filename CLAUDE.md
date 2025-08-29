# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `yarn dev` - Start development server on port 3000
- `yarn build` - Build for production (includes TypeScript checking)
- `yarn start` - Start production server

### Database Management (Drizzle ORM)

- `yarn db:generate` - Generate SQL migrations from schema changes
- `yarn db:push` - Push schema changes directly to database (for development)
- `yarn db:migrate` - Run pending migrations
- `yarn db:studio` - Open Drizzle Studio for database management

### Required Dependencies

This project uses `@vitejs/plugin-react` which may need to be installed if missing:

- `yarn add -D @vitejs/plugin-react`

## Project Architecture

### Framework Stack

- **TanStack Start**: Full-stack React framework with file-based routing
- **TanStack Router**: Type-safe client-side routing
- **Supabase**: Authentication and PostgreSQL database backend
- **Drizzle ORM**: Type-safe database queries and migrations
- **Tailwind CSS**: Styling framework
- **TypeScript**: Type safety with strict configuration

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth.tsx        # Generic auth form component
│   ├── Login.tsx       # Login-specific component
│   └── DefaultCatchBoundary.tsx
├── db/                 # Database layer
│   ├── index.ts        # Drizzle client setup and exports
│   └── schema.ts       # Database schema definitions
├── routes/             # File-based routing (TanStack Router)
│   ├── __root.tsx      # Root layout with navigation and user context
│   ├── _authed.tsx     # Authentication guard route
│   ├── _authed/        # Protected routes requiring authentication
│   └── [other routes]
├── utils/
│   ├── supabase.ts     # Supabase server client configuration
│   ├── posts.ts        # Post-related server functions (now using Drizzle)
│   └── seo.ts          # SEO utilities
└── hooks/              # Custom React hooks
drizzle/
└── migrations/         # Generated SQL migration files
```

### Authentication Architecture

- **Root Layout** (`__root.tsx`): Fetches user session on every request via `fetchUser` server function
- **Authentication Guard** (`_authed.tsx`): Protects routes by checking user context, redirects to login if unauthenticated
- **Supabase Integration**: Server-side authentication using `@supabase/ssr` with cookie-based session management

### Database Architecture (Drizzle ORM)

- **Schema Definition** (`src/db/schema.ts`): Type-safe table schemas using Drizzle
- **Database Client** (`src/db/index.ts`): Configured Drizzle client with PostgreSQL connection
- **Migrations**: Generated SQL files in `drizzle/migrations/` for version control
- **Type Safety**: Automatic TypeScript types generated from schema

### Server Functions Pattern

The codebase uses TanStack Start's `createServerFn` pattern for server-side operations:

- Authentication functions (login, user fetching)
- Database operations using Drizzle ORM (CRUD operations for posts)
- All server functions include proper validation and error handling

### Environment Requirements

Required environment variables:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon public key
- `DATABASE_URL` - PostgreSQL connection string (for Drizzle)

### TypeScript Configuration

- Strict mode enabled with comprehensive compiler options
- Path aliases configured: `~/*` maps to `./src/*`
- ESNext module system with bundler resolution
- React JSX transform configured

### Styling Approach

- Tailwind CSS with default configuration
- Dark mode classes supported throughout components
- Responsive design patterns used in layouts
