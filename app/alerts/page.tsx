import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertSystem } from "@/components/alert-system"
import { ArrowLeft } from "lucide-react"

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">Alert System</h1>
              <p className="text-muted-foreground">Monitor membership expiration alerts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AlertSystem />
      </main>
    </div>
  )
}
