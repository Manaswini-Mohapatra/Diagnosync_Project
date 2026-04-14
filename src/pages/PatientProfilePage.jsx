import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, Edit, Save, X } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";

function PatientProfilePage({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/patients/me');
        const { profile } = res.data.data;
        if (profile) {
          // Normalize backend field 'medicalConditions' → 'conditions' for the UI
          const normalized = {
            ...profile,
            conditions: profile.medicalConditions || profile.conditions || []
          };
          setProfileData(normalized);
          setEditData(normalized);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleEditClick = () => {
    setEditData(JSON.parse(JSON.stringify(profileData)));
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Map 'conditions' back to the field name the backend accepts
      const payload = {
        ...editData,
        conditions: editData.conditions
      };
      const res = await api.put('/patients/me', payload);
      const { profile } = res.data.data;
      const normalized = {
        ...profile,
        conditions: profile.medicalConditions || profile.conditions || []
      };
      setProfileData(normalized);
      setEditData(normalized);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert("Failed to save profile: " + (error.response?.data?.error || error.message));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddArray = (field, value) => {
    if (value.trim() && !editData[field].includes(value.trim())) {
      setEditData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const handleRemoveArray = (field, index) => {
    setEditData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-light-gray">
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Logo />
              <NotificationBell />
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

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="card text-center">
            <p className="text-gray-600 mb-6">
              No profile data found. Please complete your health profile registration.
            </p>
            <button
              onClick={() => navigate("/patient/registration")}
              className="btn-primary"
            >
              Complete Health Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/patient/dashboard")}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <NotificationBell />
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
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark-gray mb-2">
              My Health Profile
            </h1>
            <p className="text-gray-600">View and manage your health information</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="btn-primary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          // Edit Mode
          <div className="space-y-6">
            {/* Physical Information */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Physical Information
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={editData.height}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={editData.weight}
                      onChange={handleInputChange}
                      className="input-field w-full"
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
                      value={editData.bloodType}
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
                      value={editData.gender}
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
              </div>
            </div>

            {/* Medical History */}
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
                      placeholder="e.g., Diabetes"
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
                    {editData.conditions.map((c, i) => (
                      <span key={i} className="badge-primary flex items-center gap-2">
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
                      placeholder="e.g., Penicillin"
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
                    {editData.allergies.map((a, i) => (
                      <span key={i} className="badge-danger flex items-center gap-2">
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
                    value={editData.familyHistory}
                    onChange={handleInputChange}
                    className="input-field w-full h-24"
                  />
                </div>
              </div>
            </div>

            {/* Lifestyle */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Lifestyle
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">
                      Smoking Status
                    </label>
                    <select
                      name="smokingStatus"
                      value={editData.smokingStatus}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    >
                      <option value="never">Never Smoked</option>
                      <option value="former">Former Smoker</option>
                      <option value="current">Current Smoker</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">
                      Alcohol Consumption
                    </label>
                    <select
                      name="alcoholConsumption"
                      value={editData.alcoholConsumption}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    >
                      <option value="never">Never</option>
                      <option value="occasional">Occasional</option>
                      <option value="moderate">Moderate</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">
                      Exercise Frequency
                    </label>
                    <select
                      name="exerciseFrequency"
                      value={editData.exerciseFrequency}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    >
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="vigorous">Vigorous</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">
                      Diet
                    </label>
                    <select
                      name="diet"
                      value={editData.diet}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    >
                      <option value="balanced">Balanced</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="keto">Keto</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Emergency Contact
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={editData.emergencyContact}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={editData.emergencyPhone}
                    onChange={handleInputChange}
                    className="input-field w-full"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={handleCancel} className="btn-secondary flex-1">
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary flex-1">
                <Save className="w-4 h-4 inline mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-6">
            {/* Physical Information */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Physical Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Height</p>
                  <p className="text-lg text-dark-gray">{profileData.height || "Not specified"} cm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Weight</p>
                  <p className="text-lg text-dark-gray">{profileData.weight || "Not specified"} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Blood Type</p>
                  <p className="text-lg text-dark-gray">{profileData.bloodType || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Gender</p>
                  <p className="text-lg text-dark-gray capitalize">
                    {profileData.gender || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Medical History
              </h2>

              <div className="space-y-6">
                {/* Conditions */}
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Conditions</p>
                  {profileData.conditions?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.conditions.map((c, i) => (
                        <span key={i} className="badge-primary">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No conditions listed</p>
                  )}
                </div>

                {/* Allergies */}
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Allergies</p>
                  {profileData.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.allergies.map((a, i) => (
                        <span key={i} className="badge-danger">
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No allergies listed</p>
                  )}
                </div>

                {/* Family History */}
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">
                    Family Medical History
                  </p>
                  <p className="text-dark-gray">
                    {profileData.familyHistory || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Lifestyle */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Lifestyle
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Smoking Status</p>
                  <p className="text-lg text-dark-gray capitalize">
                    {profileData.smokingStatus || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Alcohol Consumption</p>
                  <p className="text-lg text-dark-gray capitalize">
                    {profileData.alcoholConsumption || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Exercise Frequency</p>
                  <p className="text-lg text-dark-gray capitalize">
                    {profileData.exerciseFrequency || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Diet</p>
                  <p className="text-lg text-dark-gray capitalize">
                    {profileData.diet || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Emergency Contact
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Name</p>
                  <p className="text-lg text-dark-gray">
                    {profileData.emergencyContact || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Phone</p>
                  <p className="text-lg text-dark-gray">
                    {profileData.emergencyPhone || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default PatientProfilePage;
