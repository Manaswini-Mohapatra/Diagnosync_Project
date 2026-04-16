import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, LogOut, ArrowLeft, CheckCircle } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import api from "../utils/api";

function PatientRegistrationForm({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    age: "",
    height: "",
    weight: "",
    bloodType: "",
    gender: "",

    // Medical History
    conditions: [],
    allergies: [],
    surgeries: [],
    familyHistory: "",
    medications: [],

    // Lifestyle
    smokingStatus: "never",
    alcoholConsumption: "never",
    exerciseFrequency: "moderate",
    diet: "balanced",

    // Emergency
    emergencyContact: "",
    emergencyPhone: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddArray = (field, value) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    }
  };

  const handleRemoveArray = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await api.put('/patients/me', formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to save health profile:', error);
      alert('Failed to save profile: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-light-gray">
        {/* Navbar */}
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Logo/>
              {/* <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                <img
                  src="/diagnosync_icon_transparent.svg"
                  alt="DiagnoSync Logo"
                  className="w-20 h-20"
                />
                <span className="text-3xl font-bold text-primary">
                  DiagnoSync
                </span>
              </div> */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Success Message */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="card text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">
              Health Profile Created!
            </h1>
            <p className="text-gray-600 mb-8">
              Your health information has been successfully saved. This will
              help us provide better personalized recommendations.
            </p>
            <button
              onClick={() => navigate("/patient/dashboard")}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo/>
            {/* <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <img
                src="/diagnosync_icon_transparent.svg"
                alt="DiagnoSync Logo"
                className="w-20 h-20"
              />
              <span className="text-3xl font-bold text-primary">DiagnoSync</span>
            </div> */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/patient/dashboard")}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">
            Health Profile Registration
          </h1>
          <p className="text-gray-600">
            Complete your health information to get personalized recommendations
          </p>
        </div>

        {/* Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= s ? "bg-primary" : "bg-light-gray text-gray-600"}`}
              >
                {s}
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${step > s ? "bg-primary" : "bg-light-gray"}`}
              />
            </div>
          ))}
        </div>

        {/* Step 1: Physical Info */}
        {step === 1 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">
              Physical Information
            </h2>

            <div className="space-y-6">
              {/* Age + Height + Weight row */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="25"
                    min="0"
                    max="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Blood Type
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-gray">
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Medical History */}
        {step === 2 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">
              Medical History
            </h2>

            <div className="space-y-6">
              {/* Conditions */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Existing Conditions
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    id="condition-input"
                    className="input-field flex-1"
                    placeholder="e.g., Diabetes, Hypertension"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("condition-input");
                      handleAddArray("conditions", input.value);
                      input.value = "";
                    }}
                    className="btn-primary px-6"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.conditions.map((c, i) => (
                    <span
                      key={i}
                      className="badge-primary flex items-center gap-2"
                    >
                      {c}
                      <button
                        onClick={() => handleRemoveArray("conditions", i)}
                        className="text-sm font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Allergies
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    id="allergy-input"
                    className="input-field flex-1"
                    placeholder="e.g., Penicillin, Peanuts"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("allergy-input");
                      handleAddArray("allergies", input.value);
                      input.value = "";
                    }}
                    className="btn-primary px-6"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((a, i) => (
                    <span
                      key={i}
                      className="badge-danger flex items-center gap-2"
                    >
                      {a}
                      <button
                        onClick={() => handleRemoveArray("allergies", i)}
                        className="text-sm font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Family History */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Family Medical History
                </label>
                <textarea
                  name="familyHistory"
                  value={formData.familyHistory}
                  onChange={handleInputChange}
                  className="input-field w-full h-24"
                  placeholder="Any family history of diseases..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-gray">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Lifestyle & Emergency */}
        {step === 3 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">
              Lifestyle & Emergency Info
            </h2>

            <div className="space-y-6">
              {/* Smoking */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Smoking Status
                </label>
                <select
                  name="smokingStatus"
                  value={formData.smokingStatus}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="never">Never Smoked</option>
                  <option value="former">Former Smoker</option>
                  <option value="current">Current Smoker</option>
                </select>
              </div>

              {/* Alcohol */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Alcohol Consumption
                </label>
                <select
                  name="alcoholConsumption"
                  value={formData.alcoholConsumption}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="never">Never</option>
                  <option value="occasional">Occasional</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>

              {/* Exercise */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Exercise Frequency
                </label>
                <select
                  name="exerciseFrequency"
                  value={formData.exerciseFrequency}
                  onChange={handleInputChange}
                  className="input-field w-full"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="vigorous">Vigorous</option>
                </select>
              </div>

              {/* Emergency Contact */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-gray">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="btn-success flex-1 disabled:opacity-60">
                  {isSubmitting ? 'Saving...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}

export default PatientRegistrationForm;
