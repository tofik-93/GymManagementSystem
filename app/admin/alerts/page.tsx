import { AlertSystem } from "@/components/alert-system"

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Membership Alerts</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage membership expiration alerts</p>
      </div>

      {/* Alert System */}
      <AlertSystem />
    </div>
  )
}
