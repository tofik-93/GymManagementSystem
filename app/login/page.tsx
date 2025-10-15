"use client"; // top of page.tsx


import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { setAuthenticated, isAuthenticated } from "@/lib/auth"
import { setGymId } from "@/lib/gymContext"
import { getAdmins } from "@/lib/storage" // ✅ You already have this in your Firebase code

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)

  const requestContacts = {
    phones: ["+1 (555) 123-4567", "+1 (555) 987-6543"],
    email: "support@gymtrack.com",
  }

  useEffect(() => {
    if (isAuthenticated()) router.replace("/")
  }, [router])

  // -----------------------------
  // 🧠 LOGIN HANDLER
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const admins = await getAdmins() // get all admins from Firebase
      const foundAdmin = admins.find(
        (a) => a.username === username && a.password === password.trim()
      )
      console.log(admins)

      if (!foundAdmin) {
        setError(`Invalid username or password`)
        setLoading(false)
        return
      }

      // ✅ Set global gym context
      if (!foundAdmin.gymId) {
        setError("This admin does not have a linked gym ID.")
        setLoading(false)
        return
      }
      if (foundAdmin) {
        setGymId(foundAdmin.gymId)
        setAuthenticated(true, foundAdmin.gymId)
        router.push("/")
      }
      
    } catch (err) {
      console.error("Login error:", err)
      setError("Something went wrong during login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-md shadow">
        <h2 className="text-2xl font-bold mb-4">Sign in to GYM Track</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              required
            />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex items-center justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <button
              type="button"
              className="text-sm text-primary underline"
              onClick={() => setShowRequestModal(true)}
            >
              Request Account
            </button>
          </div>
        </form>
      </div>

      {/* Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-md p-6 w-80 relative shadow-lg">
            <h3 className="text-lg font-bold mb-4">Request an Account</h3>
            <p className="text-sm mb-2">Contact us to request a new account:</p>
            <ul className="mb-4 space-y-1">
              {requestContacts.phones.map((phone, idx) => (
                <li key={idx} className="text-primary font-medium">
                  Phone: {phone}
                </li>
              ))}
              <li className="text-primary font-medium">
                Email: {requestContacts.email}
              </li>
            </ul>
            <Button onClick={() => setShowRequestModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
