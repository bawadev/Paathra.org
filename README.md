# Dhaana - Food Donation Platform

A web application for connecting food donors with monasteries to facilitate meaningful food donations.

## Features

- **User Authentication**: Secure user registration and login with Supabase Auth
- **Monastery Management**: Browse monasteries and their specific dietary requirements
- **Donation Scheduling**: Interactive calendar to book donation time slots
- **Booking Management**: Track donation history and manage bookings
- **Role-based Access**: Support for donors and monastery administrators

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Real-time)
- **Calendar**: Custom calendar component with date-fns
- **Forms**: React Hook Form with Zod validation

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   The database schema includes:
   - User profiles with role management
   - Monasteries with dietary requirements
   - Donation slots with availability tracking
   - Booking system with status management

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Application Structure

### Core Pages
- **Home (`/`)**: Landing page with navigation to key features
- **Donate (`/donate`)**: Calendar view for booking donation slots
- **My Donations (`/my-donations`)**: Personal donation history and management
- **Monasteries (`/monasteries`)**: Browse available monasteries

### User Roles
- **Donor**: Can browse monasteries, book donation slots, manage their bookings
- **Monastery Admin**: Can manage monastery information, donation slots, and view bookings
- **Super Admin**: Full system access

### Key Components
- **DonationCalendar**: Interactive calendar for slot selection
- **DonationBookingForm**: Form for creating donation bookings
- **Navigation**: Role-based navigation with user profile integration
- **AuthForm**: Unified login/registration component

## Database Schema

### Tables
1. **user_profiles**: Extended user information with roles
2. **monasteries**: Monastery details and preferences
3. **donation_slots**: Available time slots for donations
4. **donation_bookings**: Individual donation bookings

### Row Level Security
- Users can only access their own data
- Monastery admins can manage their monastery's data
- Public read access for monastery information

## Features in Detail

### Donation Booking Flow
1. User selects a date on the calendar
2. Available time slots are displayed for that date
3. User clicks on a slot to see monastery details
4. User fills out donation form with food type and details
5. Booking is created with "pending" status
6. Monastery admin can confirm or modify the booking

### Calendar Integration
- Visual calendar with disabled dates for unavailable slots
- Real-time availability updates
- Filtering by monastery and dietary requirements
- Time slot management with capacity limits

### User Management
- Secure authentication with email verification
- Profile management with contact information
- Role-based access control
- Password reset functionality

## Deployment

The application is designed to be deployed on Vercel with Supabase as the backend service.

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

## License

This project is licensed under the MIT License.
