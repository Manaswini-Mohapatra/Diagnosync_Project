import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff } from 'lucide-react'

function SignIn({ onLogin }) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient'
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    
    if (Object.keys(newErrors).length === 0) {
      // Mock authentication
      const userData = {
        id: Date.now(),
        name: formData.email.split('@')[0],
        email: formData.email,
        role: formData.role
      }
      onLogin(formData.role, userData)
      navigate(formData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard')
    } else {
      setErrors(newErrors)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">MediCare+</span>
          </div>
          <h1 className="text-3xl font-bold text-dark-gray">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">Login as</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === 'patient'}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Patient</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={formData.role === 'doctor'}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Doctor</span>
                </label>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'border-danger' : ''}`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-danger text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pr-10 ${errors.password ? 'border-danger' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Remember & Forgot */}
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link to="/password-reset" className="text-primary hover:underline">Forgot Password?</Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-primary w-full">
              Sign In
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600">
              Don't have an account? <Link to="/signup" className="text-primary hover:underline font-semibold">Sign Up</Link>
            </p>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-border-gray">
          <p className="text-sm font-semibold text-dark-gray mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-600 mb-1"><strong>Patient:</strong> patient@demo.com</p>
          <p className="text-xs text-gray-600"><strong>Doctor:</strong> doctor@demo.com</p>
        </div>
      </div>
    </div>
  )
}

export default SignIn
