import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader } from "lucide-react";
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email)       newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password)    newErrors.password = "Password is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!/\d/.test(formData.password))
      newErrors.password = "Password must contain at least 1 number";
    if (!/[A-Z]/.test(formData.password))
      newErrors.password = "Password must contain at least 1 uppercase letter";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          {/* <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-primary" />
            <img
              src="/diagnosync_icon_transparent.svg"
              alt="DiagnoSync Logo"
              className="w-20 h-20"
            />
            <span className="text-3xl font-bold text-primary">DiagnoSync</span>
          </div> */}
          <h1 className="text-3xl font-bold text-dark-gray">Create Account</h1>
          <p className="text-gray-600 mt-2">
            Join us to get personalized healthcare
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? "border-danger" : ""}`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-danger text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? "border-danger" : ""}`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-danger text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input-field ${errors.phone ? "border-danger" : ""}`}
                placeholder="+1-555-0000"
              />
              {errors.phone && (
                <p className="text-danger text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`input-field ${errors.dob ? "border-danger" : ""}`}
              />
              {errors.dob && (
                <p className="text-danger text-sm mt-1">{errors.dob}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">
                I am a
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === "patient"}
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
                    checked={formData.role === "doctor"}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Doctor</span>
                </label>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-dark-gray mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pr-10 ${errors.password ? "border-danger" : ""}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-danger text-sm mt-1">{errors.password}</p>
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
                  className="w-4 h-4 rounded mt-0.5 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Terms &amp; Conditions
                  </button>
                </label>
              </div>
              {errors.terms && (
                <p className="text-danger text-xs ml-6">{errors.terms}</p>
              )}
            </div>

            {/* API Error */}
            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-danger text-sm text-center">{apiError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-primary hover:underline font-semibold"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTerms && <TermsPopup onClose={() => setShowTerms(false)} />}
    </div>
  );
}

export default SignUp;
