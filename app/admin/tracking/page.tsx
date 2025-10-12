import { MembershipTracking } from "@/components/membership-tracking"

export default function TrackingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Membership Tracking</h1>
        <p className="text-muted-foreground mt-2">Track membership progress and renewal schedules</p>
      </div>

      {/* Membership Tracking */}
      <MembershipTracking />
    </div>
  )
}
