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

# Testing
npm run test         # Run Playwright E2E tests
npm run test:ui      # Run tests with interactive UI mode
npm run test:headed  # Run tests with visible browser
npm run test:debug   # Run tests in debug mode
npm run test:report  # View test report

# Environment Setup
# Create .env.local with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Architecture

**Tech Stack:** Next.js 15 + React 19 + TypeScript + Supabase + Tailwind CSS + shadcn/ui

**Core Architecture:**
- **App Router** with `[locale]` prefix for internationalization (English/Sinhala)
- **Server Components** by default, client components use 'use client'
- **Supabase** for auth, database, real-time updates
- **Row Level Security** for data protection
- **Progressive Enhancement** with graceful degradation

**Key Directories:**
- `app/[locale]/` - Internationalized routes organized by feature
- `components/ui/` - shadcn/ui components (don't modify directly)
- `lib/services/` - Supabase API calls with error handling
- `lib/types/` - TypeScript type definitions
- `tests/` - Playwright E2E tests
- `messages/` - i18n translations (en.json, si.json)
- `supabase/` - Database migrations

## User Roles & Access Patterns

**Role Hierarchy:**
- `donor` - Browse monasteries, book donations, manage personal bookings
- `monastery_admin` - Manage single monastery, donation slots, view bookings
- `super_admin` - Full system access, user management, analytics

**Protected Routes:**
- `/donate` - Requires authentication
- `/my-donations` - Donor-specific bookings
- `/manage/*` - Monastery admin dashboard
- `/admin/*` - Super admin panel

## Core Features & Data Flow

**Donation Booking Flow:**
1. **Browse** `/monasteries` → View monastery details and dietary requirements
2. **Book** `/donate` → Interactive calendar with real-time slot availability
3. **Track** `/my-donations` → Personal booking history and status updates
4. **Manage** `/manage/*` → Admin tools for monastery operations

**Database Schema:**
- `user_profiles` - Extended user data with role management
- `monasteries` - Monastery info with geospatial data (PostGIS)
- `donation_slots` - Time slots with capacity and availability
- `donation_bookings` - User bookings with status tracking (pending→confirmed→delivered)

## Development Patterns

**API Service Layer:**
- Use `lib/services/api.ts` for all Supabase operations
- Follow `ApiResponse<T>` pattern for consistent error handling
- Use `ApiError` class for typed error responses
- All queries use typed client from `@/lib/supabase`

**Component Patterns:**
- **Client Components** use 'use client' and hooks for interactivity
- **Server Components** fetch data directly, no loading states needed
- **Form Handling** uses React Hook Form + Zod validation
- **State Management** uses URL params and server actions

**Internationalization:**
- Routes: `/en/path` and `/si/path` with same component
- Translations in `messages/[locale].json`
- Use `useTranslations()` hook in client components
- Server components use `getTranslations()`

## Testing Strategy

**E2E Testing:**
- **Playwright** tests cover complete user flows
- **Role-based testing** for each user type
- **Visual regression** with screenshots on failures
- **Cross-browser** testing (Chrome, Firefox, Safari, Mobile)

**Test Structure:**
- `home.spec.ts` - Landing page functionality
- `auth.spec.ts` - Authentication flows
- `donations.spec.ts` - Booking and donation flow
- `monasteries.spec.ts` - Monastery browsing
- `admin.spec.ts` - Admin functionality

## Location & Maps Integration

**Geospatial Features:**
- **Leaflet** for interactive maps with OpenStreetMap/Google Maps fallback
- **PostGIS** for geospatial queries and nearby monastery search
- **Location picker** components for precise coordinate selection
- **Address autocomplete** with Google Places API

**Map Components:**
- `MonasteryMap` - Display monastery locations
- `InteractiveLocationPicker` - Location selection for monasteries
- `DualModeLocationPicker` - Toggle between map and address input

## Error Handling & Loading States

**Error Boundaries:**
- `ErrorBoundary` for React component errors
- `AuthErrorBoundary` for authentication failures
- Global error handling in API layer

**Loading Patterns:**
- **Skeleton loaders** for content-heavy pages
- **Progress indicators** for form submissions
- **Optimistic updates** with rollback on failure
- **Retry mechanisms** for network failures

## Deployment Configuration

**Optimized for Vercel:**
- **Static generation** for public pages
- **ISR** for dynamic content
- **Edge functions** for API routes
- **Environment variables** for different environments

**Build Optimization:**
- **Code splitting** by route
- **Image optimization** with Next.js Image
- **Font optimization** with next/font
- **Bundle analysis** with built-in tools


# Instructions to follow

- Always try to utilize mcp tools available.