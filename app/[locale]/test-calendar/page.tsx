'use client'

import { CalendarBookingView } from '@/components/calendar-booking-view'

// Mock data for testing
const mockBookings = [
  {
    id: '1',
    donation_slots: {
      id: 'slot1',
      date: '2025-01-20',
      time: '08:00',
      capacity: 50,
      special_requirements: 'Vegetarian meals only'
    },
    food_type: 'Rice and Curry',
    estimated_servings: 25,
    status: 'confirmed',
    special_notes: 'Extra spicy preferred',
    user_profiles: {
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    },
    created_at: '2025-01-15T10:00:00Z',
    delivery_notes: 'Please deliver to main hall'
  },
  {
    id: '2',
    donation_slots: {
      id: 'slot2',
      date: '2025-01-20',
      time: '12:00',
      capacity: 30,
    },
    food_type: 'Vegetable Soup',
    estimated_servings: 15,
    status: 'pending',
    special_notes: 'Low salt',
    user_profiles: {
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321'
    },
    created_at: '2025-01-16T14:30:00Z'
  },
  {
    id: '3',
    donation_slots: {
      id: 'slot3',
      date: '2025-01-21',
      time: '08:00',
      capacity: 40,
    },
    food_type: 'Bread and Jam',
    estimated_servings: 20,
    status: 'monastery_approved',
    user_profiles: {
      full_name: 'Mike Johnson',
      email: 'mike@example.com'
    },
    created_at: '2025-01-17T09:15:00Z'
  },
  {
    id: '4',
    donation_slots: {
      id: 'slot4',
      date: '2025-01-22',
      time: '18:00',
      capacity: 60,
    },
    food_type: 'Dinner Set',
    estimated_servings: 35,
    status: 'delivered',
    user_profiles: {
      full_name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1122334455'
    },
    created_at: '2025-01-18T16:45:00Z'
  },
  {
    id: '5',
    donation_slots: {
      id: 'slot5',
      date: '2025-01-20',
      time: '18:00',
      capacity: 25,
    },
    food_type: 'Evening Snacks',
    estimated_servings: 10,
    status: 'pending',
    user_profiles: {
      full_name: 'David Brown',
      email: 'david@example.com'
    },
    created_at: '2025-01-19T11:20:00Z'
  }
]

export default function TestCalendarPage() {
  const handleBookingAction = (bookingId: string, action: string) => {
    console.log(`Action ${action} performed on booking ${bookingId}`)
    // In a real implementation, this would make an API call
    alert(`${action} action performed on booking ${bookingId}`)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar Test Page</h1>
        <p className="text-gray-600">
          This page demonstrates the enhanced calendar view with progress bars and clickable booking details.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <CalendarBookingView
          monasteryId="test-monastery"
          bookings={mockBookings}
          onBookingAction={handleBookingAction}
        />
      </div>
      
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Features Implemented:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Progress bars beneath day numbers showing capacity status</li>
          <li>✅ Blue color for approved bookings in progress bar</li>
          <li>✅ Red color for unapproved (pending) bookings in progress bar</li>
          <li>✅ Grey background for unfilled capacity</li>
          <li>✅ Clickable bookings in the right panel</li>
          <li>✅ Detailed booking dialog with donator information</li>
          <li>✅ Approve/Decline buttons for pending bookings</li>
          <li>✅ Mark as Delivered button for confirmed bookings</li>
        </ul>
      </div>
    </div>
  )
}