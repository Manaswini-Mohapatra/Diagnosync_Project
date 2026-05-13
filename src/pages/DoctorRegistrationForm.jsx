import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, CheckCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import api from "../utils/api";
import { validateFile, formatFileSize, getFileIcon } from "../utils/documentUploadHandler";
import RegistrationStepper from "../components/RegistrationStepper";
import {
  FormSection,
  FormTile,
  TextInput,
  TextArea,
  NumberInput,
  CheckboxGrid,
  SpecialtyTags,
  StepNav,
} from "../components/FormComponents";

const STEPS = [
  { id: 1, label: "Personal Information" },
  { id: 2, label: "Education & License" },
  { id: 3, label: "Specialties & Fees" },
  { id: 4, label: "Documents" },
];

const SPECIALTIES = [
  { value: "Cardiologist",          label: "Cardiologist" },
  { value: "Dermatologist",         label: "Dermatologist" },
  { value: "Pediatrician",          label: "Pediatrician" },
  { value: "Psychiatrist",          label: "Psychiatrist" },
  { value: "Ophthalmologist",       label: "Ophthalmologist" },
  { value: "Neurologist",           label: "Neurologist" },
  { value: "Orthopedist",           label: "Orthopedist" },
  { value: "General Practitioner",  label: "General Practitioner" },
  { value: "Surgeon",               label: "Surgeon" },
  { value: "ENT Specialist",        label: "ENT Specialist" },
];

function DoctorRegistrationForm({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward");
  const [formData, setFormData] = useState({
    // Personal
    fullName: "",
    phone: "",
    about: "",
    // Education & License
    yearsOfExperience: "",
    medicalDegree: "",
    university: "",
    licenseNumber: "",
    licenseState: "",
    hospitalAffiliation: "",
    // Specialties
    specialties: [],
    consultationFee: "",
    qualifications: [],
    languages: [],
  });
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentType, setDocumentType] = useState("certificate");
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleLogout = () => { onLogout(); navigate("/"); };

  const update = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const goTo = (target) => {
    setDirection(target > step ? "forward" : "backward");
    setStep(target);
  };
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  // ── Document upload (unchanged API logic) ─────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setUploadError(""); setUploadSuccess("");
    if (!file) return;
    const validation = validateFile(file);
    if (!validation.isValid) { setUploadError(validation.error); return; }
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("documentType", documentType);
      fd.append("description", documentDescription);
      const res = await api.post("/doctors/me/documents", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setUploadedDocuments(res.data.documents);
        setUploadSuccess(`"${file.name}" uploaded successfully!`);
        e.target.value = "";
        setDocumentDescription(""); setDocumentType("certificate");
        setTimeout(() => setUploadSuccess(""), 3000);
      }
    } catch (error) {
      setUploadError(error.response?.data?.error || "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      const res = await api.delete(`/doctors/me/documents/${documentId}`);
      if (res.data.success) {
        setUploadedDocuments(res.data.documents);
        setUploadSuccess("Document deleted.");
        setTimeout(() => setUploadSuccess(""), 3000);
      }
    } catch { setUploadError("Failed to delete document."); }
  };

  const handleDownloadDocument = (doc) => {
    if (doc.fileUrl) window.open(doc.fileUrl, "_blank");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...(formData.yearsOfExperience && { yearsOfExperience: Number(formData.yearsOfExperience) }),
        ...(formData.licenseNumber     && { licenseNumber: formData.licenseNumber }),
        ...(formData.licenseState      && { licenseState: formData.licenseState }),
        ...(formData.hospitalAffiliation && { hospitalAffiliation: formData.hospitalAffiliation }),
        ...(formData.consultationFee   && { consultationFee: Number(formData.consultationFee) }),
        specialties:    formData.specialties,
        qualifications: formData.qualifications,
        languages:      formData.languages,
      };
      await api.put("/doctors/me", payload);
      setIsSubmitted(true);
    } catch (error) {
      alert("Failed to save profile: " + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <Logo />
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md w-full text-center border border-gray-100">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#1F5F7A" }} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Created!</h1>
            <p className="text-gray-500 text-sm mb-2">Your professional information has been saved.</p>
            {uploadedDocuments.length > 0 && (
              <p className="text-gray-400 text-sm mb-6">{uploadedDocuments.length} document(s) submitted for verification.</p>
            )}
            <button onClick={() => navigate("/doctor/dashboard")} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Logo />
          <div className="flex items-center gap-4">
            <button
                onClick={() => navigate("/doctor/dashboard")}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 hidden sm:inline" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>
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

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Professional Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Update and manage your professional information.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-[280px_1fr]">
            <aside className="bg-white border-b md:border-b-0 md:border-r border-gray-100 p-6 md:p-8">
              <div className="mb-6 hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">Professional Profile</h1>
                <p className="text-xs text-gray-400 mt-1">Complete your information step by step.</p>
              </div>
              <RegistrationStepper steps={STEPS} currentStep={step} onStepClick={(id) => id < step && goTo(id)} />
            </aside>

            <main className="p-6 md:p-10 lg:p-12">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <FormSection key="s1" direction={direction}>
                    <div className="space-y-2">
                      <FormTile label="Personal Information" hint="Update your personal details that will be displayed on your profile.">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <TextInput label="Full Name" value={formData.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Dr. John Doe" />
                          <TextInput label="Phone Number" type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98765 43210" />
                        </div>
                      </FormTile>
                      <FormTile label="About" hint="Write a brief description about yourself and your practice.">
                        <TextArea label="About Me" value={formData.about} onChange={(e) => update("about", e.target.value)} placeholder="Experienced doctor specialising in..." rows={4} />
                      </FormTile>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                      <button type="button" onClick={() => navigate("/doctor/dashboard")} className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        Cancel
                      </button>
                      <div className="hidden sm:block flex-1"></div>
                      <div className="w-full sm:w-auto -mt-6 sm:mt-0 border-none pt-0">
                        <StepNav isFirst onNext={next} />
                      </div>
                    </div>
                  </FormSection>
                )}

                {step === 2 && (
                  <FormSection key="s2" direction={direction}>
                    <div className="space-y-2">
                      <FormTile label="Experience & Education" hint="Provide details about your professional qualifications.">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <NumberInput label="Years of Experience" value={formData.yearsOfExperience} onChange={(e) => update("yearsOfExperience", e.target.value)} min={0} max={60} placeholder="e.g. 15" />
                          <TextInput label="Medical Degree" value={formData.medicalDegree} onChange={(e) => update("medicalDegree", e.target.value)} placeholder="MBBS, MD" />
                        </div>
                        <TextInput label="University / Institution" value={formData.university} onChange={(e) => update("university", e.target.value)} placeholder="AIIMS Delhi" />
                      </FormTile>
                      <FormTile label="License Information" hint="Your medical license details for verification.">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <TextInput label="License Number" value={formData.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} placeholder="MD-123456" />
                          <TextInput label="License State / Region" value={formData.licenseState} onChange={(e) => update("licenseState", e.target.value)} placeholder="Maharashtra" />
                        </div>
                      </FormTile>
                      <FormTile label="Hospital Affiliation" hint="The hospital or clinic you are currently affiliated with.">
                        <TextInput label="Hospital Name" value={formData.hospitalAffiliation} onChange={(e) => update("hospitalAffiliation", e.target.value)} placeholder="Apollo Hospitals, Mumbai" />
                      </FormTile>
                    </div>
                    <StepNav onBack={back} onNext={next} />
                  </FormSection>
                )}

                {step === 3 && (
                  <FormSection key="s3" direction={direction}>
                    <div className="space-y-2">
                      <FormTile label="Select Specialties" hint="Choose the medical specialties you practice. You can select multiple.">
                        <CheckboxGrid options={SPECIALTIES} selected={formData.specialties} onChange={(selected) => update("specialties", selected)} columns={2} />
                        <SpecialtyTags tags={formData.specialties} onRemove={(label) => update("specialties", formData.specialties.filter((s) => s !== label))} className="mt-4" />
                      </FormTile>
                      <FormTile label="Consultation Fee" hint="Set your standard fee per consultation session.">
                        <NumberInput label="Fee Amount" prefix="₹" value={formData.consultationFee} onChange={(e) => update("consultationFee", e.target.value)} min={0} placeholder="e.g. 800" />
                      </FormTile>
                    </div>
                    <StepNav onBack={back} onNext={next} nextLabel="Continue to Documents" />
                  </FormSection>
                )}

                {step === 4 && (
                  <FormSection key="s4" direction={direction}>
                    <div className="space-y-2">
                      <FormTile label="Verification Documents" hint="Upload your medical license, certificates, and other verification documents.">
                        {/* Alerts */}
                        {uploadError && (
                          <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-3">
                            {uploadError}
                          </div>
                        )}
                        {uploadSuccess && (
                          <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl mb-3">
                            {uploadSuccess}
                          </div>
                        )}

                        {/* Upload Form */}
                        {!showUploadForm ? (
                          <button type="button" onClick={() => setShowUploadForm(true)} className="w-full py-6 border-dashed border-2 border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-2 mb-4 hover:border-[#1F5F7A] hover:bg-[#1F5F7A]/5 transition-all text-gray-500 hover:text-[#1F5F7A]">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                            <span className="font-semibold text-sm">Click here to upload a new document</span>
                          </button>
                        ) : (
                          <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="grid gap-4 sm:grid-cols-2 mb-4">
                              <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-sm font-semibold text-gray-700">Document Type</label>
                                <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A] transition-all">
                                  <option value="certificate">Medical Certificate</option>
                                  <option value="license">License</option>
                                  <option value="degree">Medical Degree</option>
                                  <option value="specialization">Specialization Certificate</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-sm font-semibold text-gray-700 flex justify-between">
                                  <span>Description</span>
                                  <span className="text-sm text-gray-400 font-normal">Optional</span>
                                </label>
                                <input type="text" value={documentDescription} onChange={(e) => setDocumentDescription(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A] transition-all" placeholder="e.g., MBBS from AIIMS" />
                              </div>
                            </div>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 bg-white rounded-xl cursor-pointer hover:border-[#1F5F7A] hover:bg-[#1F5F7A]/5 transition-all duration-200">
                              <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" id="file-input-reg" />
                              <svg className="w-8 h-8 text-[#1F5F7A] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                              </svg>
                              <p className="text-sm font-semibold text-gray-700">Click to upload file</p>
                              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOC (Max 5MB)</p>
                            </label>
                            <div className="mt-4 flex justify-end">
                              <button type="button" onClick={() => { setShowUploadForm(false); setDocumentDescription(""); setDocumentType("certificate"); }} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                Cancel Upload
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Uploaded list */}
                        {uploadedDocuments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-xs font-bold text-gray-500">
                              Uploaded ({uploadedDocuments.length})
                            </p>
                            {uploadedDocuments.map((doc) => (
                              <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-xl">{getFileIcon(doc.fileType)}</span>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{doc.fileName}</p>
                                    <p className="text-xs text-gray-400">
                                      {formatFileSize(doc.fileSize)} · {doc.documentType} · {new Date(doc.uploadDate).toLocaleDateString()}
                                    </p>
                                    {doc.description && <p className="text-xs text-gray-500">{doc.description}</p>}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => handleDownloadDocument(doc)}
                                    className="p-2 rounded-lg hover:bg-white transition-colors text-[#1F5F7A]" title="Download">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                  </button>
                                  <button onClick={() => handleDeleteDocument(doc._id)}
                                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-400" title="Delete">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </FormTile>
                    </div>

                    <StepNav
                      onBack={back}
                      isLast
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                      submitLabel="Complete Registration"
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

export default DoctorRegistrationForm;
