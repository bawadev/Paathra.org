# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run export       # Static export for deployment

# Testing
npm run test         # Run Playwright E2E tests
npm run test:ui      # Run tests with UI mode
npm run lint         # ESLint check

# Environment Setup
# Copy .env.local and add:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Architecture

**Tech Stack:** Next.js 15 + React 19 + TypeScript + Supabase + Tailwind CSS

**Key Directories:**
- `app/[locale]/` - Internationalized routes (English/Sinhala)
- `components/ui/` - shadcn/ui components
- `lib/services/` - Supabase API calls and business logic
- `tests/` - Playwright E2E tests
- `supabase/` - Database migrations and types
- `messages/` - i18n translations

**User Roles:**
- `donor` - Browse monasteries, book donations
- `monastery_admin` - Manage monastery info and bookings
- `super_admin` - Full system access

## Core Features

**Donation Flow:**
1. User browses `/monasteries` 
2. Books slot via `/donate` calendar
3. Manages bookings via `/my-donations`
4. Monastery admins manage via `/manage`

**Database Tables:**
- `user_profiles` - Extended user data with roles
- `monasteries` - Monastery info with location/geospatial data
- `donation_slots` - Available time slots
- `donation_bookings` - User bookings with status tracking

## Development Notes

**Authentication:** Uses Supabase Auth with row-level security policies
**Maps:** Leaflet for interactive maps, supports both OpenStreetMap and Google Maps
**Calendar:** Custom calendar component with real-time availability
**Testing:** Playwright E2E tests cover user flows for all roles

**Deployment:** Optimized for Vercel with Supabase backend. Static export available for GitHub Pages.

## File Patterns

- Routes use Next.js App Router with `[locale]` prefix
- Server components by default, client components marked with 'use client'
- API routes in `app/api/` for Supabase edge functions
- All Supabase queries use typed client from `@/lib/supabase