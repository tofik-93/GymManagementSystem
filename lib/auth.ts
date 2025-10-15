import Cookies from "js-cookie"

export const AUTH_KEY = "gym_auth"
export const AUTH_EXPIRY_KEY = "gym_auth_expiry"

// ✅ Set authentication with expiry (2 hours)
export const setAuthenticated = (value: boolean, durationHours = 2) => {
  if (value) {
    const expiry = Date.now() + durationHours * 60 * 60 * 1000
    Cookies.set(AUTH_KEY, "true", { expires: durationHours / 24 })
    Cookies.set(AUTH_EXPIRY_KEY, expiry.toString(), { expires: durationHours / 24 })
  } else {
    Cookies.remove(AUTH_KEY)
    Cookies.remove(AUTH_EXPIRY_KEY)
  }
}

// ✅ Check authentication on client (optional fallback)
export const isAuthenticated = (): boolean => {
  const auth = Cookies.get(AUTH_KEY)
  const expiry = Cookies.get(AUTH_EXPIRY_KEY)
  if (!auth || !expiry) return false
  if (Date.now() > Number(expiry)) {
    logout()
    return false
  }
  return true
}

// ✅ Logout
export const logout = () => {
  Cookies.remove(AUTH_KEY)
  Cookies.remove(AUTH_EXPIRY_KEY)
}
