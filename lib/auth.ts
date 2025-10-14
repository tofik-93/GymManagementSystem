export const AUTH_KEY = "gym_auth"

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false
  return localStorage.getItem(AUTH_KEY) === "true"
}

export const setAuthenticated = (value: boolean) => {
  if (typeof window === "undefined") return
  localStorage.setItem(AUTH_KEY, value ? "true" : "false")
}

export const logout = () => {
  setAuthenticated(false)
}
