import type { Member, MembershipAlert, Admin, DashboardStats } from "./types"

// Local storage keys
const MEMBERS_KEY = "gym_members"
const ALERTS_KEY = "gym_alerts"
const ADMINS_KEY = "gym_admins"

// Initialize default admin if not exists
export const initializeDefaultAdmin = () => {
  const admins = getAdmins()
  if (admins.length === 0) {
    const defaultAdmin: Admin = {
      id: "admin-1",
      username: "admin",
      email: "admin@gym.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(ADMINS_KEY, JSON.stringify([defaultAdmin]))
  }
}

// Member operations
export const getMembers = (): Member[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(MEMBERS_KEY)
  return stored ? JSON.parse(stored) : []
}

export const saveMember = (member: Member): void => {
  const members = getMembers()
  const existingIndex = members.findIndex((m) => m.id === member.id)

  if (existingIndex >= 0) {
    members[existingIndex] = { ...member, updatedAt: new Date().toISOString() }
  } else {
    members.push(member)
  }

  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
  updateMembershipAlerts()
}

export const deleteMember = (memberId: string): void => {
  const members = getMembers().filter((m) => m.id !== memberId)
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
  updateMembershipAlerts()
}

// Alert operations
export const getAlerts = (): MembershipAlert[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(ALERTS_KEY)
  return stored ? JSON.parse(stored) : []
}

export const updateMembershipAlerts = (): void => {
  const members = getMembers()
  const alerts: MembershipAlert[] = []
  const today = new Date()

  members.forEach((member) => {
    if (!member.isActive) return

    const endDate = new Date(member.membershipEndDate)
    const timeDiff = endDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

    if (daysRemaining <= 30 && daysRemaining >= 0) {
      alerts.push({
        id: `alert-${member.id}`,
        memberId: member.id,
        memberName: member.name,
        alertType: "expiring",
        daysRemaining,
        membershipEndDate: member.membershipEndDate,
        createdAt: new Date().toISOString(),
      })
    } else if (daysRemaining < 0) {
      alerts.push({
        id: `alert-${member.id}`,
        memberId: member.id,
        memberName: member.name,
        alertType: "expired",
        daysRemaining,
        membershipEndDate: member.membershipEndDate,
        createdAt: new Date().toISOString(),
      })
    }
  })

  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
}

// Admin operations
export const getAdmins = (): Admin[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(ADMINS_KEY)
  return stored ? JSON.parse(stored) : []
}

// Dashboard stats
export const getDashboardStats = (): DashboardStats => {
  const members = getMembers()
  const alerts = getAlerts()
  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const activeMembers = members.filter((m) => m.isActive)
  const expiredMembers = alerts.filter((a) => a.alertType === "expired")
  const expiringMembers = alerts.filter((a) => a.alertType === "expiring")
  const newMembersThisMonth = members.filter((m) => new Date(m.joinDate) >= thisMonth)

  // Calculate monthly revenue (simplified)
  const monthlyRevenue = activeMembers.reduce((total, member) => {
    const rate = member.membershipType === "monthly" ? 50 : member.membershipType === "quarterly" ? 40 : 35
    return total + rate
  }, 0)

  return {
    totalMembers: members.length,
    activeMembers: activeMembers.length,
    expiredMembers: expiredMembers.length,
    expiringMembers: expiringMembers.length,
    monthlyRevenue,
    newMembersThisMonth: newMembersThisMonth.length,
  }
}
