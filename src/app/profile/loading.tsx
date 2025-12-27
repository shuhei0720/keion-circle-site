import DashboardLayout from '@/components/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner variant="profile" />
      </div>
    </DashboardLayout>
  )
}
