import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, BarChart3, Bell, Shield, Calendar, TrendingUp, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">GYM Track</h1>
              <p className="text-muted-foreground">Professional Gym Management System</p>
            </div>
            <nav className="flex gap-4">
              <Button asChild variant="outline">
                <Link href="/register">Register Member</Link>
              </Button>
              <Button asChild>
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-balance mb-6">Complete Gym Management Solution</h2>
          <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto mb-8">
            Streamline your gym operations with comprehensive member management, automated membership tracking, and
            intelligent alert systems for expiring memberships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/register">
                <UserPlus className="w-5 h-5 mr-2" />
                Register New Member
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/admin">
                <BarChart3 className="w-5 h-5 mr-2" />
                Access Admin Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <UserPlus className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Member Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete member onboarding with personal details, emergency contacts, photo upload, and membership
                selection.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <Users className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Member Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Comprehensive member directory with search, filtering, profile management, and membership tracking.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <Bell className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automated 30-day membership expiration alerts with priority levels and one-click renewal options.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time insights into membership statistics, revenue tracking, and member growth analytics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <Calendar className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Membership Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visual progress tracking with membership timelines and renewal scheduling.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Revenue Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed financial reporting with membership type breakdowns and growth trends.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Secure Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Role-based admin access with comprehensive member data protection and privacy controls.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <Settings className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle>Customizable Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Flexible configuration options for pricing, alerts, notifications, and system preferences.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 GYM Track Management System. Built for professional gym operations.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
