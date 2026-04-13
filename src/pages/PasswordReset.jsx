import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Loader, KeyRound, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo'
import api from '../utils/api'

/**
 * PasswordReset — 3-step flow
 *
 * Step 1: Enter email → POST /api/auth/forgot-password
 *         Backend generates a reset token and (when email is configured) sends it.
 *         For testing: the token is returned in the JSON response.
 *
 * Step 2: Enter the reset token received in email
 *
 * Step 3: Enter new password → POST /api/auth/reset-password
 *         On success, navigate to /signin
 */
function PasswordReset() {
  const navigate   = useNavigate()
  const [step, setStep]             = useState(1)   // 1 | 2 | 3
  const [email, setEmail]           = useState('')
  const [token, setToken]           = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  // Auto-fill token from URL query param (when user clicks link in Mailtrap email)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (urlToken) {
      setToken(urlToken)
      setStep(2) // jump straight to token step
    }
  }, [])

  // ── Step 1: Request reset link ──────────────────────────────────────────
  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return }

    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2: Verify token (just advance to step 3) ───────────────────────
  const handleVerifyToken = (e) => {
    e.preventDefault()
    setError('')
    if (!token.trim()) { setError('Please enter the reset token from your email'); return }
    setStep(3)
  }

  // ── Step 3: Set new password ────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!newPassword) { setError('Password is required'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!/\d/.test(newPassword)) { setError('Password must contain at least 1 number'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }

    setIsLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword
      })
      setSuccess(true)
      // Auto-redirect to sign in after 3 seconds
      setTimeout(() => navigate('/signin'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired token. Please start over.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold text-dark-gray">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            {step === 1 && 'Enter your email to receive a reset link'}
            {step === 2 && 'Enter the token from your email'}
            {step === 3 && 'Set your new password'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s < step ? 'bg-success text-white' :
                s === step ? 'bg-primary text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-10 h-1 rounded ${s < step ? 'bg-success' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Email Form ── */}
        {step === 1 && (
          <div className="card">
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    className={`input-field pl-10 ${error ? 'border-danger' : ''}`}
                    placeholder="john@example.com"
                    autoFocus
                  />
                </div>
                {error && <p className="text-danger text-sm mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center">
                <Link to="/signin" className="text-primary hover:underline text-sm font-semibold">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 2: Token Entry ── */}
        {step === 2 && (
          <div className="card">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-center text-gray-600 mb-4 text-sm">
              We've sent a reset token to <strong>{email}</strong>.
              Check your inbox and enter the token below.
            </p>

            <form onSubmit={handleVerifyToken} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Reset Token
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => { setToken(e.target.value); setError('') }}
                    className={`input-field pl-10 font-mono ${error ? 'border-danger' : ''}`}
                    placeholder="Paste token from email"
                    autoFocus
                  />
                </div>
                {error && <p className="text-danger text-sm mt-1">{error}</p>}
              </div>

              <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                💡 <strong>Note:</strong> If email is not configured, get the token from the backend response or check server logs.
              </p>

              <button
                type="submit"
                className="btn-primary w-full"
              >
                Verify Token
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-500 hover:text-primary text-center"
              >
                ← Go back and use a different email
              </button>
            </form>
          </div>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 3 && !success && (
          <div className="card">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                    className={`input-field pl-10 pr-10 ${error ? 'border-danger' : ''}`}
                    placeholder="Min 8 chars, 1 number"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                    className={`input-field pl-10 ${error ? 'border-danger' : ''}`}
                    placeholder="Repeat your new password"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-danger text-sm text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Resetting...</>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── Success State ── */}
        {success && (
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-dark-gray mb-2">Password Reset!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. Redirecting to sign in...
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="btn-primary w-full"
            >
              Go to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default PasswordReset
