import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader, Calendar, Shield, Activity } from "lucide-react";
import Logo from "../components/Logo";
import api from "../utils/api";

function SignIn({ onLogin }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "patient",
  });
  const [errors, setErrors]     = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError]   = useState("");
  const [weakPassword, setWeakPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const newErrors = {};

    // Frontend validation
    if (!formData.email)    newErrors.email    = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ── Real API call ────────────────────────────────────────────────
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email:    formData.email,
        password: formData.password,
      });

      const { token, user, weakPassword: isWeak } = res.data;

      // Store token — api.js will attach it automatically from now on
      localStorage.setItem('token',           token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole',         user.role);
      localStorage.setItem('currentUser',      JSON.stringify(user));

      // Pass real user (with _id from DB) to App.jsx
      onLogin(user.role, user);

      // Determine correct dashboard based on role
      const navigateTo = user.role === 'admin' 
        ? '/admin/dashboard' 
        : user.role === 'patient' 
          ? '/patient/dashboard' 
          : '/doctor/dashboard';

      if (isWeak) {
        // Show banner briefly, then navigate
        setWeakPassword(true);
        setTimeout(() => navigate(navigateTo), 3000);
      } else {
        navigate(navigateTo);
      }

    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex w-full">
      
      {/* Left Split: Hero/Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-start justify-center overflow-hidden pt-16 lg:pt-24">
         {/* Background Ornaments */}
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px]"></div>
         
         <div className="relative z-10 p-12 text-white max-w-lg w-full">
           <Link to="/" className="inline-block mb-12">
             <div className="flex items-center gap-2">
               <img src="/diagnosync_icon_transparent.svg" alt="DiagnoSync" className="w-10 h-10 brightness-0 invert" />
               <span className="text-2xl font-bold tracking-tight">DiagnoSync</span>
             </div>
           </Link>

           <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">Your health command center.</h1>
           <p className="text-lg text-blue-100 mb-12 font-medium">Connecting artificial intelligence, clinical experts and patients seamlessly in one unified platform.</p>
           
           <div className="space-y-8">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
                   <Calendar className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-lg text-white">Smart Scheduling</h3>
                   <p className="text-sm text-blue-100/80 mt-1">Book and manage appointments instantly with real-time syncing.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
                   <Activity className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-lg text-white">Health Journey Analysis</h3>
                   <p className="text-sm text-blue-100/80 mt-1">Track vital metrics and maintain complete historical logs securely.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
                   <Shield className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-lg text-white">Bank-Grade Privacy</h3>
                   <p className="text-sm text-blue-100/80 mt-1">Your personal health data is encrypted and completely secure.</p>
                 </div>
              </div>
           </div>
         </div>
      </div>

      {/* Right Split: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-6 sm:p-12 bg-light-gray relative min-h-screen overflow-y-auto pt-16 lg:pt-24">
        <div className="w-full max-w-md pb-12">
          {/* Header */}
          <div className="text-center mb-8 lg:hidden">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Welcome Back</h1>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          {/* Form wrapper */}
          <div className="glass-panel p-8 w-full border-none shadow-soft bg-white/80">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-3">
                  I am signing in as a:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition-all ${formData.role === "patient" ? "border-primary bg-blue-50/50 shadow-sm" : "border-gray-200 hover:border-blue-200 bg-white"}`}>
                    <input type="radio" name="role" value="patient" checked={formData.role === "patient"} onChange={handleChange} className="sr-only" />
                    <span className={`text-sm font-semibold ${formData.role === "patient" ? "text-primary" : "text-gray-500"}`}>Patient</span>
                  </label>
                  <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center transition-all ${formData.role === "doctor" ? "border-primary bg-blue-50/50 shadow-sm" : "border-gray-200 hover:border-blue-200 bg-white"}`}>
                    <input type="radio" name="role" value="doctor" checked={formData.role === "doctor"} onChange={handleChange} className="sr-only" />
                    <span className={`text-sm font-semibold ${formData.role === "doctor" ? "text-primary" : "text-gray-500"}`}>Doctor</span>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-1.5 focus-within:text-primary transition-colors">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field bg-white/50 border-gray-200 shadow-sm ${errors.email ? "border-danger ring-1 ring-danger" : ""}`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-danger text-xs font-medium mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-1.5 focus-within:text-primary transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field bg-white/50 border-gray-200 shadow-sm pr-10 ${errors.password ? "border-danger ring-1 ring-danger" : ""}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-danger text-xs font-medium mt-1.5">{errors.password}</p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex justify-between items-center text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary" />
                  <span className="text-gray-500 font-medium group-hover:text-gray-700 transition-colors">Remember me</span>
                </label>
                <Link
                  to="/password-reset"
                  className="text-primary hover:text-primary-dark font-semibold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Weak Password Upgrade Banner */}
              {weakPassword && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2">
                  <span className="text-amber-500 text-base mt-0.5">⚠️</span>
                  <p className="text-amber-800 text-sm font-medium">
                    Your password does not meet current security standards. Please{" "}
                    <a href="/password-reset" className="underline font-bold hover:text-amber-900">update it here</a> for better account security.
                  </p>
                </div>
              )}

              {/* API Error Message */}
              {apiError && (
                <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
                  <p className="text-danger text-sm text-center font-medium">{apiError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl shadow-soft hover:shadow-glass hover:-translate-y-px transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Authenticating...</>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-gray-500 text-sm mt-4">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:text-primary-dark font-bold transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-white/60 backdrop-blur rounded-xl border border-gray-200/60 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Demo Test Credentials
            </p>
            <div className="flex justify-center gap-6">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Patient:</span> rahul@test.com / TestPass1
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Doctor:</span> drpriya@test.com / DocPass1
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
