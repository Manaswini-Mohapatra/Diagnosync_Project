import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff } from 'lucide-react'

function SignUp({ onLogin }) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    role: 'patient'
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formData.phone) newErrors.phone = 'Phone is required'
    if (!formData.dob) newErrors.dob = 'Date of birth is required'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length === 0) {
      const userData = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
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
          <h1 className="text-3xl font-bold text-dark-gray">Create Account</h1>
          <p className="text-gray-600 mt-2">Join us to get personalized healthcare</p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'border-danger' : ''}`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-danger text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">Email</label>
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input-field ${errors.phone ? 'border-danger' : ''}`}
                placeholder="+1-555-0000"
              />
              {errors.phone && <p className="text-danger text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`input-field ${errors.dob ? 'border-danger' : ''}`}
              />
              {errors.dob && <p className="text-danger text-sm mt-1">{errors.dob}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">I am a</label>
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

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="terms" className="w-4 h-4 rounded" />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the <a href="/" className="text-primary hover:underline">Terms & Conditions</a>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-primary w-full">
              Create Account
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-600">
              Already have an account? <Link to="/signin" className="text-primary hover:underline font-semibold">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignUp
