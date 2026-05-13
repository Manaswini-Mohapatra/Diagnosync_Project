import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, Edit, Save, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";
import RegistrationStepper from "../components/RegistrationStepper";
import {
  FormSection,
  FormTile,
  FormInput,
  SelectionGroup,
  TagInput,
  StepNav,
} from "../components/FormComponents";

const EDIT_STEPS = [
  { id: 1, label: "Physical Information" },
  { id: 2, label: "Medical History" },
  { id: 3, label: "Lifestyle" },
  { id: 4, label: "Emergency Contact" },
];

function PatientProfilePage({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setStep(1);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
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
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert("Failed to save profile: " + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
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

  const updateEditData = (key, value) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
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
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
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
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 hidden sm:inline" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark-gray mb-2">
              My Health Profile
            </h1>
            <p className="text-gray-600">View and manage your health information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="btn-primary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel Edit
            </button>
          )}
        </div>

        {isEditing ? (
          // ── Edit Mode (Step-based UI) ──────────────────────────────────────
          <div className="bg-white/95 rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
            <div className="grid md:grid-cols-[280px_1fr]">
              {/* Sidebar */}
              <aside className="bg-white border-b md:border-b-0 md:border-r border-gray-100 p-6 md:p-8">
                <RegistrationStepper
                  steps={EDIT_STEPS}
                  currentStep={step}
                  onStepClick={(id) => setStep(id)}
                />
              </aside>

              {/* Content */}
              <main className="p-6 md:p-10 lg:p-12">
                <AnimatePresence mode="wait">
                  {/* Step 1: Physical Information */}
                  {step === 1 && (
                    <FormSection key="s1">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Physical Information</h2>
                      <div className="space-y-2">
                        <FormTile label="Your measurements" hint="Age, height, and weight.">
                          <FormInput label="Age (years)" type="number" name="age" value={editData.age || ""} onChange={handleInputChange} />
                          <FormInput label="Height (cm)" type="number" name="height" value={editData.height || ""} onChange={handleInputChange} />
                          <FormInput label="Weight (kg)" type="number" name="weight" value={editData.weight || ""} onChange={handleInputChange} />
                        </FormTile>
                        <FormTile label="Blood type" hint="Select your blood group.">
                          <SelectionGroup
                            options={["O+","O-","A+","A-","B+","B-","AB+","AB-"].map(v => ({ value: v, label: v }))}
                            value={editData.bloodType}
                            onChange={(v) => updateEditData("bloodType", v)}
                          />
                        </FormTile>
                        <FormTile label="Gender" hint="Select your gender.">
                          <SelectionGroup
                            options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]}
                            value={editData.gender}
                            onChange={(v) => updateEditData("gender", v)}
                          />
                        </FormTile>
                      </div>
                      <StepNav isFirst onNext={() => setStep(2)} />
                    </FormSection>
                  )}

                  {/* Step 2: Medical History */}
                  {step === 2 && (
                    <FormSection key="s2">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Medical History</h2>
                      <div className="space-y-2">
                        <FormTile label="Existing conditions" hint="Any chronic or ongoing medical conditions.">
                          <TagInput
                            tags={editData.conditions || []}
                            onTagsChange={(tags) => updateEditData("conditions", tags)}
                            placeholder="e.g. Diabetes, Hypertension"
                            suggestions={["Diabetes", "Hypertension", "Asthma", "Arthritis"]}
                          />
                        </FormTile>
                        <FormTile label="Allergies" hint="List all known allergies.">
                          <TagInput
                            tags={editData.allergies || []}
                            onTagsChange={(tags) => updateEditData("allergies", tags)}
                            placeholder="Type an allergy and press Enter"
                            suggestions={["Penicillin", "Peanuts", "Shellfish", "Dust"]}
                          />
                        </FormTile>
                        <FormTile label="Family Medical History" hint="Any significant conditions in your family.">
                          <textarea
                            name="familyHistory"
                            value={editData.familyHistory || ""}
                            onChange={handleInputChange}
                            className="w-full bg-transparent border-0 border-b-2 border-gray-200 py-3 pt-6 px-0 text-gray-900 focus:outline-none focus:border-[#1F5F7A] resize-none transition-colors duration-200"
                            rows={3}
                            placeholder="Briefly describe family medical history..."
                          />
                        </FormTile>
                      </div>
                      <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} />
                    </FormSection>
                  )}

                  {/* Step 3: Lifestyle */}
                  {step === 3 && (
                    <FormSection key="s3">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Lifestyle</h2>
                      <div className="space-y-2">
                        <FormTile label="Smoking Status" hint="Tobacco use history.">
                          <SelectionGroup
                            options={[{ value: "never", label: "Never smoked" }, { value: "former", label: "Former smoker" }, { value: "current", label: "Current smoker" }, { value: "occasional", label: "Occasional use" }]}
                            value={editData.smokingStatus}
                            onChange={(v) => updateEditData("smokingStatus", v)}
                          />
                        </FormTile>
                        <FormTile label="Alcohol Consumption" hint="Frequency of alcohol use.">
                          <SelectionGroup
                            options={[{ value: "never", label: "Never" }, { value: "occasional", label: "Occasionally" }, { value: "moderate", label: "Moderately" }, { value: "heavy", label: "Heavily" }]}
                            value={editData.alcoholConsumption}
                            onChange={(v) => updateEditData("alcoholConsumption", v)}
                          />
                        </FormTile>
                        <FormTile label="Exercise Frequency" hint="Physical activity routine.">
                          <SelectionGroup
                            options={[{ value: "sedentary", label: "Sedentary" }, { value: "light", label: "Light" }, { value: "moderate", label: "Moderate" }, { value: "vigorous", label: "Vigorous" }]}
                            value={editData.exerciseFrequency}
                            onChange={(v) => updateEditData("exerciseFrequency", v)}
                          />
                        </FormTile>
                        <FormTile label="Diet" hint="Describe your general diet.">
                          <SelectionGroup
                            options={[{ value: "balanced", label: "Balanced" }, { value: "vegetarian", label: "Vegetarian" }, { value: "vegan", label: "Vegan" }, { value: "keto", label: "Keto" }, { value: "other", label: "Other" }]}
                            value={editData.diet}
                            onChange={(v) => updateEditData("diet", v)}
                          />
                        </FormTile>
                      </div>
                      <StepNav onBack={() => setStep(2)} onNext={() => setStep(4)} />
                    </FormSection>
                  )}

                  {/* Step 4: Emergency Contact */}
                  {step === 4 && (
                    <FormSection key="s4">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Emergency Contact</h2>
                      <div className="space-y-2">
                        <FormTile label="Emergency contact name" hint="Who should we contact in case of an emergency?">
                          <FormInput label="Full name" name="emergencyContact" value={editData.emergencyContact || ""} onChange={handleInputChange} />
                        </FormTile>
                        <FormTile label="Emergency contact information" hint="Provide the best way to reach your emergency contact.">
                          <FormInput label="Phone number" type="tel" name="emergencyPhone" value={editData.emergencyPhone || ""} onChange={handleInputChange} />
                        </FormTile>
                      </div>
                      <StepNav
                        onBack={() => setStep(3)}
                        isLast
                        onSubmit={handleSave}
                        isSubmitting={isSubmitting}
                        submitLabel="Save Changes"
                      />
                    </FormSection>
                  )}
                </AnimatePresence>
              </main>
            </div>
          </div>
        ) : (
          // ── View Mode (Static Cards) ───────────────────────────────────────
          <div className="space-y-6">
            {/* Physical Information */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Physical Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Age</p>
                  <p className="text-lg text-dark-gray">{profileData.age ? `${profileData.age} years` : "Not specified"}</p>
                </div>
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
