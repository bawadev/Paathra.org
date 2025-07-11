# Monastery Dashboard Setup Guide

## Overview
The monastery dashboard provides comprehensive management tools for monastery administrators to manage their donation bookings, time slots, and monastery information.

## Features Completed

### 1. Monastery Dashboard (`/manage`)
- **Overview Statistics**: Total bookings, pending bookings, today's donations, upcoming bookings
- **Quick Action Cards**: Direct links to manage bookings, slots, and monastery info
- **Recent Bookings**: Latest 5 donation requests with accept/decline actions
- **Real-time Status Updates**: Automatic refresh after status changes

### 2. Bookings Management (`/manage/bookings`)
- **Comprehensive Booking List**: All donations with detailed information
- **Advanced Filtering**: Search by donor name, food type, email, or status
- **Status Management**: Accept, decline, mark complete, or reopen bookings
- **Donor Information**: Contact details, food specifications, special notes
- **Bulk Actions**: Efficient management of multiple bookings

### 3. Donation Slots Management (`/manage/slots`)
- **Calendar Interface**: Visual date selection for slot management
- **Individual Slot Creation**: Custom time slots with specific requirements
- **Bulk Slot Generation**: Automatically create 30 days of standard slots
- **Slot Configuration**: Set capacity, special requirements, and availability
- **Real-time Stats**: Overview of total slots, bookings, and capacity

### 4. Monastery Information (`/manage/monastery`)
- **Complete Profile Setup**: Name, description, address, capacity
- **Contact Management**: Phone, email, website information
- **Dietary Requirements**: Multi-select dietary restrictions and preferences
- **Donation Preferences**: Preferred times and special instructions
- **Dynamic Form**: Creates new monastery or updates existing information

## User Flow for Monastery Admins

### Initial Setup
1. Register as a regular user
2. Navigate to `/manage/monastery` to set up monastery profile
3. System automatically assigns `monastery_admin` role
4. Create donation slots using bulk generation or individual creation

### Daily Operations
1. **Dashboard Review** (`/manage`):
   - Check pending bookings requiring attention
   - Review today's donation schedule
   - Monitor upcoming bookings

2. **Booking Management** (`/manage/bookings`):
   - Accept or decline pending donation requests
   - Contact donors for coordination
   - Mark completed donations
   - Handle cancellations

3. **Slot Management** (`/manage/slots`):
   - Add new time slots for special events
   - Disable slots during monastery closures
   - Adjust capacity based on requirements
   - Set special requirements for specific dates

## Technical Features

### Database Integration
- **Row Level Security**: Monastery admins can only access their own data
- **Real-time Updates**: Automatic booking count management
- **Referential Integrity**: Proper relationships between tables
- **Audit Trail**: Created/updated timestamps for all records

### User Experience
- **Role-based Access**: Different interfaces for donors vs. monastery admins
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clear menu structure with breadcrumbs
- **Real-time Feedback**: Success/error messages for all actions

### Security & Permissions
- **Authentication Required**: All management features require login
- **Role Verification**: Only monastery admins can access management pages
- **Data Isolation**: Each monastery admin sees only their data
- **Secure Updates**: Protected API endpoints with proper validation

## API Endpoints Used

### Monastery Management
- `GET /monasteries` - Fetch monastery information
- `POST /monasteries` - Create new monastery
- `PUT /monasteries` - Update monastery details

### Booking Management
- `GET /donation_bookings` - Fetch bookings with filters
- `PUT /donation_bookings` - Update booking status
- `POST /donation_bookings` - Create new booking (from donor side)

### Slot Management
- `GET /donation_slots` - Fetch available slots
- `POST /donation_slots` - Create individual or bulk slots
- `PUT /donation_slots` - Update slot availability
- `DELETE /donation_slots` - Remove unused slots

## Testing the Features

### Prerequisites
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Create a user account or sign in

### Test Scenarios

#### As a New Monastery Admin:
1. Sign up with email: `admin@testmonastery.org`
2. Navigate to `/manage/monastery`
3. Fill out monastery information form
4. Go to `/manage/slots` and create bulk slots
5. Check `/manage` dashboard for overview

#### As an Existing Monastery Admin:
1. Sign in to your account
2. Go to `/manage/bookings` to see pending donations
3. Accept/decline booking requests
4. Use filters to find specific bookings
5. Update monastery information in `/manage/monastery`

#### Testing Donor-Admin Interaction:
1. Create donor account and book a donation slot
2. Sign in as monastery admin
3. Check dashboard for new pending booking
4. Navigate to bookings management
5. Accept the booking and verify status update

## Future Enhancements

### Planned Features
- **Email Notifications**: Automatic emails for booking confirmations
- **Calendar Integration**: Export slots to Google Calendar
- **Reporting**: Monthly donation reports and analytics
- **Photo Upload**: Monastery and food photos
- **Rating System**: Donor feedback and monastery ratings

### Integration Opportunities
- **SMS Notifications**: Text message alerts for urgent bookings
- **Payment Processing**: Optional donation payments
- **Social Media**: Share monastery updates and achievements
- **Volunteer Management**: Coordinate volunteer helpers

## Troubleshooting

### Common Issues
1. **Access Denied**: Ensure user has `monastery_admin` role
2. **No Monastery Found**: Complete monastery setup first
3. **Bookings Not Showing**: Check date filters and slot availability
4. **Slot Creation Errors**: Verify date is in the future and not duplicate

### Database Verification
```sql
-- Check user role
SELECT user_type FROM user_profiles WHERE id = 'your-user-id';

-- Verify monastery assignment
SELECT * FROM monasteries WHERE admin_id = 'your-user-id';

-- Check recent bookings
SELECT * FROM donation_bookings 
WHERE donation_slot_id IN (
  SELECT id FROM donation_slots 
  WHERE monastery_id = 'your-monastery-id'
) ORDER BY created_at DESC;
```

## Support
For technical issues or feature requests, please check the application logs and database constraints. The system is designed to be self-explanatory with clear error messages and guidance.
