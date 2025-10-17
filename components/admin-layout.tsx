"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { logout, getAdminLanguage, setAdminLanguage } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { translations } from "@/lib/language"
import {
  LayoutDashboard,
  Users,
  Bell,
  Calendar,
  UserPlus,
  Settings,
  Menu,
  LogOut,
  BarChart3,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
  children: React.ReactNode
  alertCount?: number
}

export function AdminLayout({ children, alertCount = 0 }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // ✅ Load language from cookie on mount
  const [language, setLanguage] = useState<"en" | "am">("en")
  const [mounted, setMounted] = useState(false)
  const t = translations[language]
  
  useEffect(() => {
    const lang = getAdminLanguage()
    setLanguage(lang)
    setMounted(true)
  }, [])
  
  if (!mounted) return null  // avoid server/client mismatch
  
  const navigation = [
    { name: t.dashboard, href: "/admin", icon: LayoutDashboard },
    { name: t.members, href: "/admin/members", icon: Users },
    { name: t.alerts, href: "/admin/alerts", icon: Bell, badge: alertCount > 0 ? alertCount : undefined },
    { name: t.tracking, href: "/admin/tracking", icon: Calendar },
    { name: t.addMember, href: "/admin/register", icon: UserPlus },
    { name: t.reports, href: "/admin/reports", icon: BarChart3 },
    { name: t.settings, href: "/admin/settings", icon: Settings },
  ]

  const handleToggleLanguage = () => {
    const newLang = language === "en" ? "am" : "en"
    setLanguage(newLang)
    setAdminLanguage(newLang) // ✅ persist in cookie
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">{t.title}</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-y-7 px-6 py-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-auto">{item.badge}</Badge>
                  )}
                </Link>
              </li>
            )
          })}

          {/* Language toggle as nav item */}
          <li>
            <button
              onClick={handleToggleLanguage}
              className="w-full group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Globe className="h-5 w-5 shrink-0" />
              <span className="flex-1">{language === "en" ? "Amharic" : "English"}</span>
            </button>
          </li>
        </ul>

        {/* Logout */}
        <div className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => {
              logout()
              router.push("/login")
            }}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {t.logout}
          </Button>
        </div>
      </nav>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-card px-4 shadow-sm lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex-1 text-sm font-semibold leading-6">{t.title}</div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
