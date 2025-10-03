import { redirect } from 'next/navigation'

export default function AdminPage() {
  // Redirect to the admin dashboard
  redirect('/admin/dashboard')
}
