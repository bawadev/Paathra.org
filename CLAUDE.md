# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run build:ci     # Build without linting (for CI)
npm run export       # Static export for deployment
npm run start        # Start production server
npm run lint         # ESLint check
npm run typecheck    # TypeScript type checking

# Testing
npm run test         # Run Playwright E2E tests
npm run test:ui      # Run tests with interactive UI mode
npm run test:headed  # Run tests with visible browser
npm run test:debug   # Run tests in debug mode
npm run test:report  # View test report

# Database
npm run db:reset     # Reset Supabase local development database
npm run db:types     # Generate TypeScript types from database
npm run db:studio    # Open Supabase Studio

# Environment Setup
# Create .env.local with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Project Architecture

**Tech Stack:** Next.js 15 + React 19 + TypeScript + Supabase + Tailwind CSS + shadcn/ui

**Core Architecture:**
- **App Router** with `[locale]` prefix for internationalization (English/Sinhala)
- **Server Components** by default, client components use 'use client'
- **Supabase** for auth, database, real-time updates, and storage
- **Row Level Security** for data protection
- **Progressive Enhancement** with graceful degradation

**Directory Structure:**
```
app/[locale]/                 # Internationalized routes
├── donate/                   # Donation booking flow
├── my-donations/            # User donation history
├── manage/                  # Monastery admin dashboard
├── admin/                   # Super admin panel
├── auth/                    # Authentication flows
├── monasteries/             # Browse/search monasteries
└── profile/                 # User profile management

components/                   # Reusable components
├── ui/                      # shadcn/ui components (don't modify)
├── forms/                   # Form components with validation
├── maps/                    # Location picker components
└── navigation.tsx           # Main navigation with role-based menus

lib/                         # Core utilities
├── services/api.ts          # Supabase API wrapper with error handling
├── auth-context.tsx         # Authentication state management
├── supabase.ts             # Supabase client configuration
└── types/database.types.ts  # Generated database types

tests/                       # E2E tests
├── auth.spec.ts            # Authentication flows
├── donations.spec.ts       # Donation booking
├── monasteries.spec.ts     # Monastery browsing
├── admin.spec.ts          # Admin functionality
├── home.spec.ts           # Landing page
└── manage.spec.ts         # Management features

messages/                    # i18n translations
├── en.json                # English
├── si.json                # Sinhala
└── ta.json                # Tamil (placeholder)

supabase/                   # Database migrations and config
├── migrations/            # Database schema migrations
├── seed.sql              # Sample data
└── config.toml           # Supabase configuration
```

## Database Schema

**Core Tables:**
- **user_profiles** - Extended user data with role management
  - id (uuid, pk), email, full_name, phone, address, avatar_url
  - user_types: enum[] ('donor', 'monastery_admin', 'super_admin')

- **monasteries** - Monastery information with geospatial data
  - id (uuid, pk), name, description, address, location (PostGIS point)
  - monks_count, contact_info, user_id (owner), approved (bool)

- **donation_slots** - Time slots for donations
  - id (uuid, pk), monastery_id, date, time, capacity, status
  - special_requirements, created_by

- **donation_bookings** - User bookings with status tracking
  - id (uuid, pk), donation_slot_id, donor_id, status, special_notes
  - estimated_servings, contact_phone, confirmed_at, delivered_at
  - Status enum: pending, monastery_approved, confirmed, delivered, not_delivered, cancelled

- **user_roles** - Role assignments (junction table for many-to-many)
  - user_id, role, assigned_at

## User Roles & Access Patterns

**Role Hierarchy:**
1. **donor** - Browse monasteries, book donations, manage personal bookings
2. **monastery_admin** - Manage single monastery, donation slots, view bookings
3. **super_admin** - Full system access, user management, analytics

**Protected Routes:**
- `/donate` - Requires authentication
- `/my-donations` - Donor-specific bookings
- `/manage/*` - Monastery admin dashboard
- `/admin/*` - Super admin panel

## Key Technologies & Dependencies

**Core Framework:**
- Next.js 15 (App Router, Turbopack)
- React 19 (Server Components, Suspense)
- TypeScript 5.7

**Database & Backend:**
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- PostGIS for geospatial queries
- Zod for schema validation

**UI & Styling:**
- Tailwind CSS 3.4
- shadcn/ui components
- Radix UI primitives
- Lucide React icons

**Forms & Validation:**
- React Hook Form
- Zod validation
- Server Actions for form handling

**Internationalization:**
- next-intl (Messages, routing, dates)
- English/Sinhala support with Tamil placeholder

**Maps & Location:**
- Leaflet for interactive maps
- Google Maps API for geocoding
- PostGIS for nearby monastery search

**Testing:**
- Playwright E2E tests
- Cross-browser testing (Chrome, Firefox, Safari, Mobile)
- Visual regression testing

## Development Patterns

**API Service Layer:**
```typescript
// Use the ApiResponse pattern for consistent error handling
const result = await api.createDonationBooking(data)
if (result.error) {
  // Handle error with typed error messages
}
```

**Form Handling:**
```typescript
// Server actions with validation
const schema = z.object({
  full_name: z.string().min(2),
  phone: z.string().optional()
})
```

**Role Checking:**
```typescript
// Use the hasRole utility
if (hasRole(profile, 'monastery_admin')) {
  // Show monastery admin features
}
```

**Database Queries:**
```typescript
// Use RLS with typed client
const { data, error } = await supabase
  .from('donation_bookings')
  .select('*, donation_slots(*, monasteries(*))')
  .eq('donor_id', user.id)
```

## Testing Strategy

**E2E Coverage:**
- **auth.spec.ts** - Sign up, sign in, sign out flows
- **donations.spec.ts** - Complete donation booking flow
- **monasteries.spec.ts** - Browse, search, filter monasteries
- **admin.spec.ts** - Admin panel functionality
- **manage.spec.ts** - Monastery management features
- **home.spec.ts** - Landing page functionality

**Test Commands:**
```bash
# Run specific test suite
npm run test auth.spec.ts

# Run with specific browser
npm run test -- --project=firefox

# Debug mode with visible browser
npm run test:debug -- --headed
```

## Build & Deployment

**Vercel Optimized:**
- Static generation for public pages
- ISR for dynamic content
- Edge functions for API routes
- Environment variables for different stages

**Performance Optimizations:**
- Code splitting by route
- Image optimization with Next.js Image
- Font optimization with next/font
- Bundle analysis with built-in tools

**Environment Configuration:**
```bash
# Development
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_MAPS_API_KEY=

# Production (Vercel)
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_VERCEL_URL=
```

## Common Development Tasks

**Adding a New Route:**
1. Create folder in `app/[locale]/new-feature/`
2. Add `page.tsx` with appropriate component
3. Update navigation in `components/navigation.tsx`
4. Add translations to `messages/[locale].json`
5. Create/update tests in `tests/`

**Adding Database Table:**
1. Create migration in `supabase/migrations/`
2. Run `npm run db:types` to update TypeScript types
3. Update `lib/types/database.types.ts`
4. Create API service in `lib/services/`
5. Add RLS policies in Supabase dashboard

**Adding New Translation:**
1. Add keys to all `messages/[locale].json` files
2. Use `useTranslations()` hook in client components
3. Use `getTranslations()` in server components
4. Test with all supported locales

**Adding New Test:**
1. Create file in `tests/` directory
2. Use existing test patterns as reference
3. Test with `npm run test:ui` for visual debugging
4. Ensure tests pass in CI/CD

## Troubleshooting

**Common Issues:**
- **Translation not loading**: Restart dev server, check JSON syntax
- **Database connection**: Verify .env.local values
- **Role access issues**: Check user_types array in user_profiles
- **Upload failures**: Verify storage policies in Supabase dashboard

**Debug Commands:**
```bash
# Check database connection
npm run db:types

# Verify translation files
npm run lint

# Debug tests
npm run test:debug -- --headed --project=chromium

# Check build
npm run build:ci
```

## Workflow

You need to follow below rules with every action:
- Use supabase mcp when you have doubts on db structure and tasks involve db
- Always ask permission before changing db structure
- After every task test the feature using playwright mcp (don't use screenshot feature, analyze from console and text form of DOM)
- Use credentials in .creds to login when using playwright mcp
- Don't assume task is success, test through playwright mcp and verify
- If you need to read documentation use context7 mcp or do a web search
- If you keep running into same issue do a web search
- Always use IDE provided tools to detect errors or warnings after any implementation
- "Might be" is not good enough - validate and come to solid conclusions in planning phase

## Important Instruction Reminders

- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested by the User