import Cookies from "js-cookie"
import { setGymId } from "./gymContext"
export const AUTH_KEY = "gym_auth"
export const AUTH_EXPIRY_KEY = "gym_auth_expiry"

export const GYM_KEY = "gym_id"

// ✅ Set gym ID with expiry
export const setGymIdCookie = (gymId: string, durationHours = 2) => {
  Cookies.set(GYM_KEY, gymId, { expires: durationHours / 24 })
}

// ✅ Get gym ID
export const getGymIdCookie = (): string | null => {
  return Cookies.get(GYM_KEY) || null
}
export const setAuthenticated = (value: boolean, gymId?: string, durationHours = 2) => {
  if (value) {
    const expiry = Date.now() + durationHours * 60 * 60 * 1000
    Cookies.set(AUTH_KEY, "true", { expires: durationHours / 24 })
    Cookies.set(AUTH_EXPIRY_KEY, expiry.toString(), { expires: durationHours / 24 })
    if (gymId) setGymIdCookie(gymId, durationHours)
  } else {
    Cookies.remove(AUTH_KEY)
    Cookies.remove(AUTH_EXPIRY_KEY)
    removeGymIdCookie()
  }
}
export const isAuthenticated = (): boolean => {
  const auth = Cookies.get(AUTH_KEY)
  const expiry = Cookies.get(AUTH_EXPIRY_KEY)
  if (!auth || !expiry) return false
  if (Date.now() > Number(expiry)) {
    logout()
    return false
  }

  // ✅ restore gym ID into global context
  const gymId = getGymIdCookie()
  if (gymId) setGymId(gymId)

  return true
}
export const logout = () => {
  Cookies.remove(AUTH_KEY)
  Cookies.remove(AUTH_EXPIRY_KEY)
}
// ✅ Clear gym ID
export const removeGymIdCookie = () => {
  Cookies.remove(GYM_KEY)
}
