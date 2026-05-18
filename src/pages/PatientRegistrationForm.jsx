import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, CheckCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import api from "../utils/api";
import RegistrationStepper from "../components/RegistrationStepper";
import {
  FormSection,
  FormTile,
  FormInput,
  SelectionGroup,
  TagInput,
  FileUploadZone,
  StepNav,
} from "../components/FormComponents";

const STEPS = [
  { id: 1, label: "Basic Information" },
  { id: 2, label: "Medical History" },
  { id: 3, label: "Lifestyle" },
  { id: 4, label: "Emergency Contact" },
  { id: 5, label: "Documents Upload" },
];

const initialFormData = {
  // Basic
  age: "",
  height: "",
  weight: "",
  bloodType: "",
  gender: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  // Medical History
  hasAllergies: "",
  allergies: [],
  hasMedications: "",
  medications: [],
  conditions: [],
  familyHistory: "",
  // Lifestyle
  smokingStatus: "",
  alcoholConsumption: "",
  exerciseFrequency: "",
  diet: "",
  // Emergency
  emergencyContact: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  emergencyEmail: "",
};

function PatientRegistrationForm({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward");
  const [formData, setFormData] = useState(initialFormData);
  const [localFiles, setLocalFiles] = useState([]); // UI-only file list
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => { onLogout(); navigate("/"); };

  const update = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleInputChange = (e) => update(e.target.name, e.target.value);

  const goTo = (target) => {
    setDirection(target > step ? "forward" : "backward");
    setStep(target);
  };
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Build payload from formData — map new fields back to existing API shape
      const payload = {
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        bloodType: formData.bloodType,
        gender: formData.gender,
        conditions: formData.conditions,
        allergies: formData.allergies,
        medications: formData.medications,
        familyHistory: formData.familyHistory,
        smokingStatus: formData.smokingStatus,
        alcoholConsumption: formData.alcoholConsumption,
        exerciseFrequency: formData.exerciseFrequency,
        diet: formData.diet,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
      };
      await api.put("/patients/me", payload);

      // Upload any attached documents
      if (localFiles && localFiles.length > 0) {
        for (const file of localFiles) {
          const reportData = new FormData();
          // Use the file name as the report title for auto-uploaded files
          reportData.append("title", file.name);
          reportData.append("report", file.raw);
          
          await api.post("/patients/me/reports", reportData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        }
      }

      setIsSubmitted(true);
    } catch (error) {
      alert("Failed to save profile: " + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success ──────────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <Logo />
            <button onClick={handleLogout} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md w-full text-center border border-gray-100">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#1F5F7A" }} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Profile Saved!</h1>
            <p className="text-gray-500 text-sm mb-8">Your information has been saved. We'll use it to personalise your care.</p>
            <button onClick={() => navigate("/patient/dashboard")} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Layout ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Logo />
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/patient/dashboard")} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Card with sidebar + content */}
        <div className="bg-white/95 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-[280px_1fr]">

            {/* Sidebar — RegistrationStepper (vertical on desktop, horizontal on mobile) */}
            <aside className="bg-white border-b md:border-b-0 md:border-r border-gray-100 p-6 md:p-8">
              <div className="mb-6 hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">Health Profile</h1>
                <p className="text-xs text-gray-400 mt-1">Complete your information step by step.</p>
              </div>
              <RegistrationStepper
                currentStep={step}
                onStepClick={(id) => id < step && goTo(id)}
              />
            </aside>

            <main className="p-6 md:p-10 lg:p-12">
              <AnimatePresence mode="wait">
                {/* ── Step 1: Basic Information ── */}
                {step === 1 && (
                  <FormSection key="s1" direction={direction}>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">Basic Information</h2>
                    <p className="text-sm text-gray-400 mb-6">Tell us about yourself so we can personalise your care.</p>

                    <div className="space-y-2">
                      <FormTile
                        label="What's your legal name?"
                        hint="Enter your name as it appears on your legal ID."
                      >
                        <FormInput label="First name" name="firstName" onChange={handleInputChange} />
                        <FormInput label="Last name" name="lastName" onChange={handleInputChange} />
                      </FormTile>

                      <FormTile label="Date of birth" hint="We need this to verify your identity.">
                        <FormInput label="Date of birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
                      </FormTile>

                      <FormTile label="How can we contact you?" hint="We'll send appointment reminders to these.">
                        <FormInput label="Email address" type="email" name="email" value={formData.email} onChange={handleInputChange} />
                        <FormInput label="Phone number" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                      </FormTile>

                      <FormTile label="Your measurements" hint="Used to calculate BMI and clinical references.">
                        <FormInput label="Age (years)" type="number" name="age" value={formData.age} onChange={handleInputChange} />
                        <FormInput label="Height (cm)" type="number" name="height" value={formData.height} onChange={handleInputChange} />
                        <FormInput label="Weight (kg)" type="number" name="weight" value={formData.weight} onChange={handleInputChange} />
                      </FormTile>

                      <FormTile label="Blood type" hint="Select your blood group if known.">
                        <SelectionGroup
                          options={["O+","O-","A+","A-","B+","B-","AB+","AB-"].map(v => ({ value: v, label: v }))}
                          value={formData.bloodType}
                          onChange={(v) => update("bloodType", v)}
                        />
                      </FormTile>

                      <FormTile label="Gender" hint="Select the gender that best describes you.">
                        <SelectionGroup
                          options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other / Prefer not to say" }]}
                          value={formData.gender}
                          onChange={(v) => update("gender", v)}
                        />
                      </FormTile>
                    </div>

                    <StepNav isFirst onNext={next} />
                  </FormSection>
                )}

                {/* ── Step 2: Medical History ── */}
                {step === 2 && (
                  <FormSection key="s2" direction={direction}>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">Medical History</h2>
                    <p className="text-sm text-gray-400 mb-6">Help us understand your existing health conditions.</p>

                    <div className="space-y-2">
                      <FormTile
                        label="Do you have any known allergies?"
                        hint="This helps us avoid prescribing medications that could cause adverse reactions."
                      >
                        <SelectionGroup
                          options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unknown", label: "I'm not sure" }]}
                          value={formData.hasAllergies}
                          onChange={(v) => update("hasAllergies", v)}
                        />
                      </FormTile>

                      {formData.hasAllergies === "yes" && (
                        <FormTile
                          label="What are you allergic to?"
                          hint="List all known allergies including medications, food, and environmental factors."
                        >
                          <TagInput
                            tags={formData.allergies}
                            onTagsChange={(tags) => update("allergies", tags)}
                            placeholder="Type an allergy and press Enter"
                            suggestions={["Penicillin", "Peanuts", "Shellfish", "Latex", "Dust", "Pollen"]}
                          />
                        </FormTile>
                      )}

                      <FormTile
                        label="Are you currently taking any medications?"
                        hint="Include prescription drugs, over-the-counter medications, and supplements."
                      >
                        <SelectionGroup
                          options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]}
                          value={formData.hasMedications}
                          onChange={(v) => update("hasMedications", v)}
                        />
                      </FormTile>

                      {formData.hasMedications === "yes" && (
                        <FormTile
                          label="What medications are you taking?"
                          hint="List all current medications with dosages if known."
                        >
                          <TagInput
                            tags={formData.medications}
                            onTagsChange={(tags) => update("medications", tags)}
                            placeholder="Type a medication and press Enter"
                            suggestions={["Aspirin", "Ibuprofen", "Vitamin D", "Fish Oil", "Multivitamin"]}
                          />
                        </FormTile>
                      )}

                      <FormTile
                        label="Existing conditions"
                        hint="Any chronic or ongoing medical conditions diagnosed by a doctor."
                      >
                        <TagInput
                          tags={formData.conditions}
                          onTagsChange={(tags) => update("conditions", tags)}
                          placeholder="e.g. Diabetes, Hypertension"
                          suggestions={["Diabetes", "Hypertension", "Asthma", "Arthritis"]}
                        />
                      </FormTile>

                      <FormTile
                        label="Are you able to submit your medical records in English?"
                        hint="Your medical records are essential to the physician review process."
                      >
                        <SelectionGroup
                          options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "no-records", label: "I do not have any medical records" }]}
                          value={formData.canSubmitRecords}
                          onChange={(v) => update("canSubmitRecords", v)}
                        />
                      </FormTile>
                    </div>

                    <StepNav onBack={back} onNext={next} />
                  </FormSection>
                )}

                {/* ── Step 3: Lifestyle ── */}
                {step === 3 && (
                  <FormSection key="s3" direction={direction}>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">Lifestyle</h2>
                    <p className="text-sm text-gray-400 mb-6">Your daily habits help us provide better recommendations.</p>

                    <div className="space-y-2">
                      <FormTile
                        label="Do you currently smoke or use tobacco products?"
                        hint="Tobacco use affects treatment options and recovery outcomes."
                      >
                        <SelectionGroup
                          options={[{ value: "never", label: "Never smoked" }, { value: "former", label: "Former smoker" }, { value: "current", label: "Current smoker" }, { value: "occasional", label: "Occasional use" }]}
                          value={formData.smokingStatus}
                          onChange={(v) => update("smokingStatus", v)}
                        />
                      </FormTile>

                      <FormTile
                        label="Alcohol consumption"
                        hint="How frequently do you consume alcoholic beverages?"
                      >
                        <SelectionGroup
                          options={[{ value: "never", label: "Never" }, { value: "occasional", label: "Occasionally" }, { value: "moderate", label: "Moderately" }, { value: "heavy", label: "Heavily" }]}
                          value={formData.alcoholConsumption}
                          onChange={(v) => update("alcoholConsumption", v)}
                        />
                      </FormTile>

                      <FormTile
                        label="How often do you exercise?"
                        hint="Regular physical activity is important for your overall health assessment."
                      >
                        <SelectionGroup
                          options={[{ value: "sedentary", label: "Sedentary (Little or no exercise)" }, { value: "light", label: "Light (1-3 times a week)" }, { value: "moderate", label: "Moderate (3-5 times a week)" }, { value: "vigorous", label: "Vigorous (Daily or intense)" }]}
                          value={formData.exerciseFrequency}
                          onChange={(v) => update("exerciseFrequency", v)}
                        />
                      </FormTile>

                      <FormTile
                        label="How would you describe your diet?"
                        hint="Understanding your dietary habits helps us provide personalised recommendations."
                      >
                        <SelectionGroup
                          options={[{ value: "balanced", label: "Balanced / No restrictions" }, { value: "vegetarian", label: "Vegetarian" }, { value: "vegan", label: "Vegan" }, { value: "keto", label: "Keto / Low-carb" }, { value: "other", label: "Other dietary restrictions" }]}
                          value={formData.diet}
                          onChange={(v) => update("diet", v)}
                        />
                      </FormTile>
                    </div>

                    <StepNav onBack={back} onNext={next} />
                  </FormSection>
                )}

                {/* ── Step 4: Emergency Contact ── */}
                {step === 4 && (
                  <FormSection key="s4" direction={direction}>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">Emergency Contact</h2>
                    <p className="text-sm text-gray-400 mb-6">Who should we contact in case of an emergency?</p>

                    <div className="space-y-2">
                      <FormTile label="Emergency contact name" hint="Who should we contact in case of an emergency?">
                        <FormInput label="Full name" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} />
                      </FormTile>

                      <FormTile label="What is their relationship to you?" hint="Help us understand how to communicate with your emergency contact.">
                        <FormInput label="Relationship" name="emergencyRelationship" value={formData.emergencyRelationship} onChange={handleInputChange} placeholder="e.g. Spouse, Parent, Sibling" />
                      </FormTile>

                      <FormTile label="Emergency contact information" hint="Provide the best way to reach your emergency contact.">
                        <FormInput label="Phone number" type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} />
                        <FormInput label="Email address" type="email" optional name="emergencyEmail" value={formData.emergencyEmail} onChange={handleInputChange} />
                      </FormTile>
                    </div>

                    <StepNav onBack={back} onNext={next} />
                  </FormSection>
                )}

                {/* ── Step 5: Documents Upload ── */}
                {step === 5 && (
                  <FormSection key="s5" direction={direction}>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">Documents Upload</h2>
                    <p className="text-sm text-gray-400 mb-6">Upload any relevant medical records, test results, or ID documents.</p>

                    <div className="space-y-2">
                      <FormTile
                        label="Upload your documents"
                        hint="We accept PDF, DOC, DOCX, JPG, and PNG files (max 10 MB each)."
                      >
                        <FileUploadZone
                          files={localFiles}
                          onFilesChange={setLocalFiles}
                        />
                      </FormTile>
                    </div>

                    <StepNav
                      onBack={back}
                      isLast
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                      submitLabel="Save Health Profile"
                    />
                  </FormSection>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PatientRegistrationForm;
