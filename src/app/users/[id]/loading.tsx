import DashboardLayout from '@/components/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <LoadingSpinner variant="profile" size="lg" />
      </div>
    </DashboardLayout>
  )
}
