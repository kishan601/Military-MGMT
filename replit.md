# Military Asset Management System (M.A.M.S.)

## Overview

M.A.M.S. is a tactical logistics platform designed for military commanders and logistics personnel to manage the movement, assignment, and expenditure of critical assets across multiple bases. The system provides real-time inventory tracking, asset transfers between bases, purchase records, and assignment management with role-based access control.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom military-themed design tokens (tactical green, slate gray, alert amber)
- **Charts**: Recharts for dashboard data visualization
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Authentication**: Dual auth system supporting both local username/password (Passport.js with session-based auth) and Replit OAuth integration
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Core Entities**:
  - Users (with roles: ADMIN, COMMANDER, LOGISTICS)
  - Bases (military installations)
  - Assets (vehicles, weapons, ammunition, communication equipment)
  - Transactions (purchases, transfers, assignments, expenditures)

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    hooks/        # Custom React hooks (auth, data fetching)
    pages/        # Route page components
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API endpoint definitions
  storage.ts      # Database access layer
  auth.ts         # Local authentication setup
shared/           # Shared between client and server
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with Zod schemas
```

### Development vs Production
- Development: Vite dev server with HMR proxied through Express
- Production: Static file serving from `dist/public`, bundled server in `dist/index.cjs`

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, requires `DATABASE_URL` environment variable

### Authentication Services
- **Replit OAuth** (optional): OIDC-based authentication when running on Replit
- **Session Secret**: Requires `SESSION_SECRET` environment variable for session signing

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `passport` / `passport-local`: Authentication middleware
- `express-session` / `connect-pg-simple`: Session management
- `zod`: Runtime type validation for API inputs/outputs
- `@tanstack/react-query`: Client-side data fetching and caching
- `recharts`: Dashboard charts and visualizations
- `date-fns`: Date formatting and manipulation