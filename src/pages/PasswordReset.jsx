import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, CheckCircle } from 'lucide-react'

function PasswordReset() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Email is required')
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email')
      return
    }

    // Mock submission
    setError('')
    setSubmitted(true)
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
          <h1 className="text-3xl font-bold text-dark-gray">Reset Password</h1>
          <p className="text-gray-600 mt-2">Enter your email to reset your password</p>
        </div>

        {/* Form */}
        {!submitted ? (
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  className={`input-field ${error ? 'border-danger' : ''}`}
                  placeholder="john@example.com"
                />
                {error && <p className="text-danger text-sm mt-1">{error}</p>}
              </div>

              <button type="submit" className="btn-primary w-full">
                Send Reset Link
              </button>

              <div className="text-center">
                <Link to="/signin" className="text-primary hover:underline text-sm font-semibold">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        ) : (
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-dark-gray mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="btn-primary w-full"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PasswordReset
