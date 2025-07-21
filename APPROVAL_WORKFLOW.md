# Donation Booking Approval Workflow Implementation

## Overview
The Dhaana platform now implements a comprehensive approval workflow for donation bookings that ensures monastery oversight and proper tracking of donation deliveries.

## Workflow States

### 1. **Pending** (`pending`)
- **Initial state** when a donor creates a booking
- **Who can see**: Donor and monastery admin
- **Available actions**: 
  - Monastery: Approve or Decline
  - Donor: Cancel request

### 2. **Monastery Approved** (`monastery_approved`)
- **State after** monastery approves a pending booking
- **Who can see**: Donor and monastery admin
- **Available actions**:
  - Donor: Confirm donation or Cancel
  - Monastery: Wait for donor confirmation

### 3. **Confirmed** (`confirmed`)
- **State after** donor confirms a monastery-approved booking
- **Who can see**: Donor and monastery admin
- **Available actions**:
  - Monastery: Mark as Delivered or Not Delivered on donation day
  - Both: Wait for donation day

### 4. **Delivered** (`delivered`)
- **Final state** when monastery confirms donation was received
- **Metadata**: Delivery timestamp, notes, confirmed by monastery admin
- **Actions**: None (final state)

### 5. **Not Delivered** (`not_delivered`)
- **Final state** when donation was not received as expected
- **Metadata**: Delivery timestamp, notes explaining why, confirmed by monastery admin
- **Actions**: None (final state)

### 6. **Cancelled** (`cancelled`)
- **Can be reached from**: pending, monastery_approved, confirmed
- **Who can cancel**: Donor (their own bookings), Monastery admin
- **Actions**: Monastery can reopen recent cancellations

## Database Schema Updates

### Updated `donation_bookings` table fields:
- `status` (enum): `pending | monastery_approved | confirmed | delivered | not_delivered | cancelled`
- `monastery_approved_at` (timestamp): When monastery approved
- `monastery_approved_by` (uuid): Which admin approved
- `confirmed_at` (timestamp): When donor confirmed
- `delivery_confirmed_at` (timestamp): When delivery status was set
- `delivery_confirmed_by` (uuid): Which admin confirmed delivery
- `delivery_status` (text): `received | not_received`
- `delivery_notes` (text): Notes about delivery

### `booking_confirmations` table:
- Tracks all status transitions for audit trail
- Records who made changes and when

## Implementation Files

### 1. **Workflow Engine** (`/lib/services/booking-workflow.ts`)
- Centralized workflow management
- Role-based permission checking
- Audit trail logging
- Type-safe state transitions

### 2. **Updated TypeScript Types** (`/lib/supabase.ts`)
- Updated `DonationBooking` interface with new fields
- Added `BookingConfirmation` interface

### 3. **Monastery Management** (`/app/manage/bookings/page.tsx`)
- Approve/decline pending bookings
- Mark delivery status with notes
- Filter by status including new states
- Visual indicators for each workflow stage

### 4. **Donor Interface** (`/app/my-donations/page.tsx`)
- Confirm monastery-approved bookings
- Cancel requests at appropriate stages
- Clear status indicators
- Explanatory messages for each state

## User Experience Flow

### For Donors:
1. **Create booking** → Status: `pending`
2. **Wait for monastery approval** → Notification when approved
3. **Confirm donation** → Status: `confirmed`
4. **Make donation on scheduled day**
5. **See final delivery status** → `delivered` or `not_delivered`

### For Monastery Admins:
1. **Review pending requests** → Approve or decline
2. **Wait for donor confirmation** → Status: `monastery_approved`
3. **On donation day** → Mark as received or not received with notes
4. **Track all donations** → Complete audit trail

## Security & Permissions

### Role-Based Access:
- **Donors**: Can only modify their own bookings
- **Monastery Admins**: Can only modify bookings for their monastery
- **Super Admins**: Can modify any booking

### Transition Validation:
- Each status change validates current state
- Permission checks before any transition
- Audit logging for all changes

## Error Handling & Validation

### Frontend:
- Type-safe action handlers
- Clear error messages
- Graceful degradation if workflow fails

### Backend:
- Database constraints ensure data integrity
- Proper error responses
- Transaction safety for state changes

## Testing Recommendations

### Manual Testing:
1. Create booking as donor → Verify `pending` status
2. Approve as monastery admin → Verify `monastery_approved` status
3. Confirm as donor → Verify `confirmed` status
4. Mark delivery status → Verify final state and notes

### Edge Cases:
- Try to skip workflow steps (should fail)
- Test cross-monastery permissions (should fail)
- Test cancellation at different stages
- Test reopening cancelled bookings

## Future Enhancements

### Notifications:
- Email/SMS notifications for status changes
- Reminder system for confirmed donations
- Monastery notifications for pending approvals

### Analytics:
- Delivery success rates by monastery
- Average approval times
- Cancellation patterns

### Mobile Optimizations:
- Push notifications for status changes
- Offline capability for viewing bookings
- Quick action buttons for common tasks

This implementation provides a robust, secure, and user-friendly approval workflow that ensures proper oversight while maintaining a smooth user experience for both donors and monasteries.
