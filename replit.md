# replit.md

## Overview

This is a **Daily Student Task Tracking Web Application** designed for Islamic daily practices. Students log in daily to mark 10 fixed religious tasks (prayers, Quran recitation, Azkar) as completed or not completed, earning 1 mark per completed task. The app features two user roles: Students who submit daily reports and view their history, and Admins who can view all student reports, filter by date/student, see leaderboards, charts, and export data to CSV.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and interactions
- **Charts**: Recharts for dashboard analytics visualization
- **Build Tool**: Vite with React plugin

The frontend follows a pages-based architecture with shared components. Path aliases are configured (`@/` for client source, `@shared/` for shared code). Mobile-first responsive design is prioritized throughout.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with Local Strategy, JWT tokens stored in cookies
- **Password Security**: scrypt hashing with random salts
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation schemas
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

The server uses a monolithic architecture where Vite dev server is integrated during development, and static files are served in production. Score calculation is performed server-side to prevent client manipulation.

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Tables**: 
  - `users`: id, username (email), password (hashed), name, role (student/admin), createdAt
  - `reports`: id, userId, date, tasks (JSONB), totalMarks, submittedAt

### Authentication & Authorization
- JWT-based authentication with 7-day token expiry
- Cookie-based token storage for seamless session handling
- Role-based access control (student vs admin routes)
- Admin account auto-created with predefined credentials
- Open registration for students

### Fixed Task List
The application tracks exactly 10 fixed Islamic daily tasks:
1. Fajr Namaz
2. Zuhr Namaz
3. Asr Namaz
4. Maghrib Namaz
5. Isha Namaz
6. Shaam ke Azkar
7. Subha ke Azkar
8. Quran ki Tilawat
9. Sote Waqt ke Azkar
10. Dua

## External Dependencies

### Database
- PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- connect-pg-simple for session storage
- drizzle-orm and drizzle-kit for database operations and migrations

### UI Component Libraries
- shadcn/ui components (Radix UI primitives)
- Tailwind CSS for styling
- class-variance-authority for component variants
- Lucide React for icons

### Data & Forms
- TanStack React Query for data fetching/caching
- React Hook Form with Zod resolver for form validation
- date-fns for date formatting
- react-day-picker for calendar components

### Build & Development
- Vite for frontend bundling
- esbuild for server bundling
- tsx for TypeScript execution in development
- Replit-specific Vite plugins for development experience