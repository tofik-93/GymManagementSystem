"use client";

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { setAuthenticated, isAuthenticated, setCurrentAdmin } from "@/lib/auth"
import { setGymId } from "@/lib/gymContext"
import { getAdmins } from "@/lib/storage"
import { Eye, EyeOff, Lock, User, Dumbbell, Phone, Mail, X, Heart } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const requestContacts = {
    phones: ["+1 (555) 123-4567", "+1 (555) 987-6543"],
    email: "admin@flexfitness.com",
  }

  useEffect(() => {
    if (isAuthenticated()) router.replace("/")
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const admins = await getAdmins()
      const foundAdmin = admins.find(
        (a) => a.username === username && a.password === password.trim()
      )

      if (!foundAdmin) {
        setError(`Invalid username or password`)
        setLoading(false)
        return
      }

      if (!foundAdmin.gymId) {
        setError("This admin does not have a linked gym ID.")
        setLoading(false)
        return
      }

      if (foundAdmin) {
        // Check if admin is active
        if (!foundAdmin.isActive) {
          setError("Your account has been deactivated. Please contact your manager.")
          setLoading(false)
          return
        }

        setGymId(foundAdmin.gymId)
        setAuthenticated(true, foundAdmin.gymId)
        setCurrentAdmin(foundAdmin)
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      {/* Floating Fitness Icons */}
      <div className="absolute top-20 left-10 opacity-20 animate-float">
        <Dumbbell className="w-12 h-12 text-white" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-20 animate-float" style={{ animationDelay: '2s' }}>
        <Heart className="w-10 h-10 text-white" />
      </div>
      <div className="absolute top-1/3 right-20 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
        <Dumbbell className="w-8 h-8 text-white" />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform rotate-45">
                <div className="transform -rotate-45">
                  <Dumbbell className="w-10 h-10 text-orange-500" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg"></div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">FLEX FITNESS</h1>
          <p className="text-white/90 font-semibold text-lg">Strength • Discipline • Results</p>
          <div className="w-24 h-1 bg-white/50 rounded-full mx-auto mt-3"></div>
        </div>

        {/* Login Form */}
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
            <p className="text-white/90">Manage your gym operations</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  required
                  className="pl-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 h-12 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  className="pl-12 pr-12 bg-white/20 border-white/30 text-white placeholder:text-white/60 h-12 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-400/50 rounded-xl backdrop-blur-sm">
                <p className="text-white text-sm text-center font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-orange-600 hover:bg-white/90 font-bold text-lg rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none border-2 border-white"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                  Signing in...
                </div>
              ) : (
                "ACCESS DASHBOARD"
              )}
            </Button>

            {/* Request Account Link */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setShowRequestModal(true)}
                className="text-white/90 hover:text-white text-sm font-semibold underline transition-colors"
              >
                Request Admin Account
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/80 text-sm font-medium">
            Secure Flex Fitness Management System
          </p>
        </div>
      </div>

      {/* Request Account Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRequestModal(false)}
          />
          
          {/* Modal Content */}
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl border border-orange-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900">Flex Fitness</h3>
                <p className="text-orange-600 font-semibold text-sm">Admin Account Request</p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Contact the Flex Fitness management team to request administrator access for your location.
              </p>
              
              <div className="space-y-3">
                {/* Phone Contacts */}
                {requestContacts.phones.map((phone, idx) => (
                  <div key={idx} className="flex items-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <Phone className="w-5 h-5 text-orange-600 mr-3" />
                    <div>
                      <p className="text-gray-600 text-sm">Phone {idx + 1}</p>
                      <p className="text-gray-900 font-semibold">{phone}</p>
                    </div>
                  </div>
                ))}
                
                {/* Email Contact */}
                <div className="flex items-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <Mail className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="text-gray-900 font-semibold">{requestContacts.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-100 rounded-lg border border-orange-200">
                <p className="text-orange-800 text-xs text-center font-medium">
                  Please have your gym location and manager details ready when contacting us.
                </p>
              </div>
            </div>

            {/* Close Button */}
            <Button 
              onClick={() => setShowRequestModal(false)}
              className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl h-12 transition-all border-2 border-orange-600"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
