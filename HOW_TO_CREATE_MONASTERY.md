# How to Create a Monastery in Dhaana

## Overview
The Dhaana food donation platform allows users to register monasteries and become monastery administrators. This guide explains the complete process for creating a monastery profile.

## Who Can Create a Monastery?
Any registered user on the platform can create a monastery. Once a monastery is created, the user automatically becomes a "monastery admin" with access to management features.

## Step-by-Step Process

### 1. Sign Up or Sign In
- Go to the Dhaana homepage
- Create an account or sign in with existing credentials
- You'll start as a regular "donor" user

### 2. Access Monastery Creation
There are multiple ways to access the monastery creation page:

**Option A: From Homepage**
- Look for the "Create Monastery" card on the homepage
- Click "Register Monastery" button

**Option B: From Navigation**
- In the top navigation, click "Create Monastery" link
- This option is only visible to non-monastery-admin users

**Option C: Direct URL**
- Navigate directly to `/manage/monastery`

### 3. Fill Out Monastery Information

#### Basic Information
- **Name**: Your monastery's full name
- **Description**: Brief description of your monastery and mission
- **Address**: Complete physical address
- **Phone**: Contact phone number
- **Email**: Contact email address
- **Website**: Your monastery's website (optional)
- **Capacity**: Maximum number of donors you can accommodate per slot

#### Dietary Requirements
Select all applicable dietary restrictions:
- Vegetarian
- Vegan
- No Onion
- No Garlic
- Gluten Free
- Dairy Free
- Halal
- Kosher
- Organic Only

#### Donation Preferences
- **Preferred Donation Times**: Describe your preferred donation schedule and any special instructions

### 4. Submit and Become Admin
- Click "Save Monastery Information"
- The system will:
  - Create your monastery record
  - Automatically upgrade your user type to "monastery_admin"
  - Refresh the page to show your new admin access

### 5. Complete Your Setup
After creating your monastery, you'll gain access to:

#### Management Dashboard (`/manage`)
- Overview of pending bookings
- Today's donation schedule
- Quick statistics

#### Donation Slots (`/manage/slots`)
- Create individual time slots
- Bulk generate slots for 30 days
- Set specific requirements per slot

#### Bookings Management (`/manage/bookings`)
- Review pending donation requests
- Accept or decline bookings
- Communicate with donors

#### Monastery Information (`/manage/monastery`)
- Update your monastery details
- Modify dietary requirements
- Change contact information

## What Happens After Creation?

### Immediate Changes
1. Your user type changes from "donor" to "monastery_admin"
2. Navigation menu updates to show "Manage" options
3. "Create Monastery" options disappear from your interface
4. You gain access to all monastery management features

### Next Steps
1. **Create Donation Slots**: Go to `/manage/slots` and create time slots when donors can visit
2. **Set Up Availability**: Use bulk slot creation for regular schedules
3. **Wait for Bookings**: Donors can now find and book slots at your monastery
4. **Manage Requests**: Review and respond to donation requests through the bookings page

## Technical Details

### Database Changes
- New record created in `monasteries` table with your user ID as `admin_id`
- Your `user_profiles` record updated with `user_type: 'monastery_admin'`
- Row Level Security policies ensure you can only access your monastery's data

### Permissions
As a monastery admin, you can:
- View and manage bookings for your monastery only
- Create and modify donation slots for your monastery
- Update your monastery information
- View donor contact information for confirmed bookings

### Data Security
- Only you can see and manage your monastery's bookings
- Donors can see basic monastery information (name, address, dietary requirements)
- Personal donor information is only visible after they make a booking

## Troubleshooting

### Common Issues

**"Access Denied" Error**
- Make sure you're signed in
- Try refreshing the page after creating the monastery
- Contact support if the issue persists

**Monastery Information Not Saving**
- Check that all required fields are filled
- Ensure your internet connection is stable
- Look for error messages on the form

**Can't Access Management Features**
- Verify your user type was updated to "monastery_admin"
- Try signing out and signing back in
- Clear your browser cache

### Getting Help
- Check the browser console for error messages
- Verify your internet connection
- Contact the platform administrators if problems persist

## Example Monastery Setup

Here's an example of how to fill out the monastery form:

```
Name: Peaceful Valley Monastery
Description: A Buddhist monastery dedicated to mindfulness and community service. We welcome food donations to support our resident monks and community programs.
Address: 123 Mountain View Road, Peaceful Valley, CA 90210
Phone: (555) 123-4567
Email: donations@peacefulvalley.org
Website: https://peacefulvalley.org
Capacity: 25
Dietary Requirements: Vegetarian, No Onion, No Garlic
Preferred Donation Times: We prefer donations between 10 AM and 2 PM on weekdays. Please include simple, fresh ingredients. Rice, vegetables, and fruits are especially appreciated.
```

## Next Steps After Reading This Guide

1. Sign up or sign in to your Dhaana account
2. Navigate to the monastery creation page
3. Fill out all required information accurately
4. Submit the form and wait for confirmation
5. Start creating donation slots for your monastery
6. Begin accepting food donations from the community

## Support
If you need assistance with creating your monastery or have questions about the platform, please refer to the main README.md file or contact the development team.
