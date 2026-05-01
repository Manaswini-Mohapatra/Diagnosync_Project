import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader, Shield, Lock, Users } from "lucide-react";
import Logo from "../components/Logo";
import api from "../utils/api";
import TermsPopup from "../components/TermsPopup";

function SignUp({ onLogin }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    role: "patient",
  });
  const [errors, setErrors]         = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [apiError, setApiError]     = useState("");
  const [showTerms, setShowTerms]   = useState(false);

  const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#^])[A-Za-z\d@$!%*?&\-_#^]{8,}$/;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email)       newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password)    newErrors.password = "Password is required";
    else if (!STRONG_PASSWORD_REGEX.test(formData.password))
      newErrors.password = "Password must be 8+ characters with uppercase, lowercase, number and special character.";
    if (!formData.phone)       newErrors.phone = "Phone number is required";
    if (!formData.dob)         newErrors.dob = "Date of birth is required";
    if (!agreedToTerms)        newErrors.terms = "You must agree to the Terms & Conditions";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ── Real API call ────────────────────────────────────────────────
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name:     formData.name.trim(),
        email:    formData.email,
        password: formData.password,
        phone:    formData.phone,
        role:     formData.role,
      });

      const { token, user } = res.data;

      // Store token — same pattern as SignIn
      localStorage.setItem('token',           token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole',         user.role);
      localStorage.setItem('currentUser',      JSON.stringify(user));

      onLogin(user.role, user);
      navigate(user.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');

    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
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
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px]"></div>
         
         <div className="relative z-10 p-12 text-white max-w-lg w-full">
           <Link to="/" className="inline-block mb-12">
             <div className="flex items-center gap-2">
               <img src="/diagnosync_icon_transparent.svg" alt="DiagnoSync" className="w-10 h-10 brightness-0 invert" />
               <span className="text-2xl font-bold tracking-tight">DiagnoSync</span>
             </div>
           </Link>

           <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">Join the healthcare revolution.</h1>
           <p className="text-lg text-blue-100 mb-12 font-medium">Create your account in seconds and unlock a personalized care experience.</p>
           
           <div className="space-y-8">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
                   <Users className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-lg text-white">Unified Profiles</h3>
                   <p className="text-sm text-blue-100/80 mt-1">One account gives you access to top tier clinical systems instantly.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
                   <Shield className="w-6 h-6 text-white" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-lg text-white">Verified Care</h3>
                   <p className="text-sm text-blue-100/80 mt-1">All our providers are rigorously authenticated and certified.</p>
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
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Create Account</h1>
            <p className="text-gray-500">Join us to get personalized healthcare</p>
          </div>

          {/* Form wrapper */}
          <div className="glass-panel p-8 w-full border-none shadow-soft bg-white/80">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-3">
                  I am a
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

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-1.5 focus-within:text-primary transition-colors">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field bg-white/50 border-gray-200 shadow-sm ${errors.name ? "border-danger ring-1 ring-danger" : ""}`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-danger text-xs font-medium mt-1.5">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-1.5 focus-within:text-primary transition-colors">
                  Email
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

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-1.5 focus-within:text-primary transition-colors">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field bg-white/50 border-gray-200 shadow-sm ${errors.phone ? "border-danger ring-1 ring-danger" : ""}`}
                  placeholder="+1-555-0000"
                />
                {errors.phone && (
                  <p className="text-danger text-xs font-medium mt-1.5">{errors.phone}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-1.5 focus-within:text-primary transition-colors">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`input-field bg-white/50 border-gray-200 shadow-sm ${errors.dob ? "border-danger ring-1 ring-danger" : ""}`}
                />
                {errors.dob && (
                  <p className="text-danger text-xs font-medium mt-1.5">{errors.dob}</p>
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
                {errors.password ? (
                  <p className="text-danger text-xs font-medium mt-1.5">{errors.password}</p>
                ) : (
                  <p className="text-gray-400 text-xs mt-1.5 flex items-start gap-1">
                    <span className="text-gray-300 mt-0.5">ⓘ</span>
                    Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number and one special character.
                  </p>
                )}
              </div>

            {/* Terms Checkbox */}
            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
                  }}
                  className="w-4 h-4 rounded mt-0.5 border-gray-300 text-primary focus:ring-primary accent-primary flex-shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-primary hover:text-primary-dark font-medium transition-colors"
                  >
                    Terms & Conditions
                  </button>
                </label>
              </div>
              {errors.terms && (
                <p className="text-danger text-xs font-medium ml-6">{errors.terms}</p>
              )}
            </div>

            {/* API Error Message */}
            {apiError && (
              <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
                <p className="text-danger text-sm text-center font-medium">{apiError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl shadow-soft hover:shadow-glass hover:-translate-y-px transition-all mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader className="w-5 h-5 animate-spin" /> Creating Account...</>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-500 text-sm mt-4 pt-4 border-t border-gray-100">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-primary hover:text-primary-dark font-bold transition-colors"
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsPopup 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        onAgree={() => { setAgreedToTerms(true); setErrors(prev => ({ ...prev, terms: '' })); }} 
      />
    </div>
  );
}

export default SignUp;
