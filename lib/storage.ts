import { ref, get, set, update, remove, push } from "firebase/database"
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage"
import {rtdb ,storage} from "@/lib/firebaseConfig" 
import type { Member, MembershipAlert, Admin, DashboardStats, GymSettings } from "./types"
import { getGymId } from "@/lib/gymContext"
import imageCompression from "browser-image-compression";
// ------------------------
// Default Admin Initialization

// ------------------------


export const initializeDefaultAdmin = async () => {

  const snapshot = await get(ref(rtdb, "admins"))
  if (!snapshot.exists()) {
    const defaultAdmin: Admin = {
      id: "admin-1",
      username: "admin",
      email: "admin@gym.com",
      role: "admin",
      createdAt: new Date().toISOString(),
      password : "1234",
      gymId : "1",
    }
    await set(ref(rtdb, `admins/${defaultAdmin.id}`), defaultAdmin)
  }
}

// ------------------------
// Member Operations
// ------------------------
export const getMembers = async (): Promise<Member[]> => {
  
  const gymId = getGymId()
  const snapshot = await get(ref(rtdb, `gyms/${gymId}/members`))
  return snapshot.exists() ? Object.values(snapshot.val()) as Member[] : []
}
export const saveSettings = async (settings: GymSettings): Promise<void> => {
  try {
    const gymId = getGymId()
    await set(ref(rtdb, `gyms/${gymId}/settings`), {
      ...settings,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("Error saving settings:", err)
    throw err
  }
}

// 🔹 Get settings from Firebase
export const getSettings = async (): Promise<GymSettings | null> => {
  try {
    const gymId = getGymId()
    const snapshot = await get(ref(rtdb, `gyms/${gymId}/settings`))
    if (!snapshot.exists()) return null
    return snapshot.val() as GymSettings
  } catch (err) {
    console.error("Error fetching settings:", err)
    return null
  }
}
export const saveMember = async (member: Member, photoFile?: File): Promise<void> => {
  let photoUrl = member.photo;
  const gymId = getGymId();

  if (photoFile) {
    // 🔹 Compress the image
    const options = {
      maxSizeMB: 0.1, // target <100 KB
      maxWidthOrHeight: 800, // optional: limit resolution
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(photoFile, options);
    console.log(compressedFile.size)
    // 🔹 Upload compressed image
    const photoRef = storageRef(storage, `gyms/${gymId}/members/${member.id}.jpg`);
    await uploadBytes(photoRef, compressedFile);
    photoUrl = await getDownloadURL(photoRef);
  }

  // 🔹 Save member data
  const memberRef = ref(rtdb, `/gyms/${gymId}/members/${member.id}`);
  await set(memberRef, {
    ...member,
    photo: photoUrl,
    updatedAt: new Date().toISOString(),
  });

  await updateSingleMembershipAlert(member);
};
const updateSingleMembershipAlert = async (member: Member): Promise<void> => {
  const gymId = getGymId();
  const alertsRef = ref(rtdb, `gyms/${gymId}/alerts/${member.id}`);
  const today = new Date();
  const endDate = new Date(member.membershipEndDate);
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

  let alert: MembershipAlert | null = null;

  if (daysRemaining <= 30 && daysRemaining >= 0) {
    alert = {
      id: `alert-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      alertType: "expiring",
      daysRemaining,
      membershipEndDate: member.membershipEndDate,
      createdAt: new Date().toISOString(),
    };
  } else if (daysRemaining < 0) {
    alert = {
      id: `alert-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      alertType: "expired",
      daysRemaining,
      membershipEndDate: member.membershipEndDate,
      createdAt: new Date().toISOString(),
    };
  }

  if (alert) {
    await set(alertsRef, alert);
  } else {
    await remove(alertsRef);
  }
};

export const updateMember = async (memberId: string, updates: Partial<Member>, photoFile?: File): Promise<void> => {
  const gymId = getGymId();
  const memberRef = ref(rtdb, `/gyms/${gymId}/members/${memberId}`);

  let updatedPhotoUrl = updates.photo;

  // 🔹 Handle optional photo upload (with compression)
  if (photoFile) {
    const options = {
      maxSizeMB: 0.1, // <100KB target
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(photoFile, options);
    const photoRef = storageRef(storage, `gyms/${gymId}/members/${memberId}.jpg`);
    await uploadBytes(photoRef, compressedFile);
    updatedPhotoUrl = await getDownloadURL(photoRef);
  }

  const updateData = {
    ...updates,
    ...(updatedPhotoUrl && { photo: updatedPhotoUrl }),
    updatedAt: new Date().toISOString(),
  };

  await update(memberRef, updateData);
};

export const deleteMember = async (memberId: string): Promise<void> => {
  const gymId = getGymId()
  await remove(ref(rtdb, `gyms/${gymId}/members/${memberId}`))
  await updateMembershipAlerts()
}

// ------------------------
// Alerts Operations
// ------------------------
export const getAlerts = async (): Promise<MembershipAlert[]> => {
  const gymId = getGymId()
  const snapshot = await get(ref(rtdb, `gyms/${gymId}/alerts`))
  const data = snapshot.val()

  if (!data || typeof data !== "object") return []

  return Object.values(data) as MembershipAlert[]
}

export const updateMembershipAlerts = async (): Promise<void> => {
  const gymId = getGymId()
  const members = await getMembers()
  const alerts: Record<string, MembershipAlert> = {}
  const today = new Date()

  members.forEach((member) => {
    if (!member.isActive) return
    const endDate = new Date(member.membershipEndDate)
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (daysRemaining <= 30 && daysRemaining >= 0) {
      alerts[member.id] = {
        id: `alert-${member.id}`,
        memberId: member.id,
        memberName: member.name,
        alertType: "expiring",
        daysRemaining,
        membershipEndDate: member.membershipEndDate,
        createdAt: new Date().toISOString(),
      }
    } else if (daysRemaining < 0) {
      alerts[member.id] = {
        id: `alert-${member.id}`,
        memberId: member.id,
        memberName: member.name,
        alertType: "expired",
        daysRemaining,
        membershipEndDate: member.membershipEndDate,
        createdAt: new Date().toISOString(),
      }
    }
  })
  await set(ref(rtdb, `gyms/${gymId}/alerts`), alerts)
}
export const updateAdminPassword = async (adminId: string, newPassword: string) => {
  const adminRef = ref(rtdb, `admins/${adminId}`);
  await update(adminRef, { password: newPassword, updatedAt: new Date().toISOString() });
};


// ------------------------
// Admin Operations
// ------------------------
export const getAdmins = async (): Promise<Admin[]> => {

  const snapshot = await get(ref(rtdb, `admins`))
  return snapshot.exists() ? Object.values(snapshot.val()) as Admin[] : []
}

// ------------------------
// Dashboard Stats
// ------------------------
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const gymId = getGymId()
  const members = await getMembers()
  const alerts = await getAlerts()

  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const activeMembers = members.filter((m) => m.isActive)
  const expiredMembers = alerts.filter((a) => a.alertType === "expired")
  const expiringMembers = alerts.filter((a) => a.alertType === "expiring")
  const newMembersThisMonth = members.filter((m) => new Date(m.joinDate) >= thisMonth)

  const monthlyRevenue = activeMembers.reduce((total, member) => {
    const rate =
      member.membershipType === "monthly"
        ? 50
        : member.membershipType === "quarterly"
        ? 40
        : 35
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
