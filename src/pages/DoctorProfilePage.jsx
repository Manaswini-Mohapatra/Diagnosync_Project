import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, Edit, Save, X, Upload, Download, Trash2 } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";
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
import { AnimatePresence } from "framer-motion";
import {
  validateFile,
  fileToBase64,
  saveDoctorDocument,
  getDoctorDocuments,
  deleteDoctorDocument,
  formatFileSize,
  getFileIcon,
} from "../utils/documentUploadHandler";

const EMPTY_PROFILE = {
  yearsOfExperience: "",
  licenseNumber: "",
  licenseState: "",
  hospitalAffiliation: "",
  consultationFee: "",
  specialties: [],
  bio: "",
  availableSlots: {},
};

const SPECIALTY_OPTIONS = [
  "Cardiologist", "Neurologist", "Dermatologist", "Orthopedist",
  "Pediatrician", "General Practitioner", "Psychiatrist", "Surgeon",
  "Ophthalmologist", "ENT Specialist",
];

function DoctorProfilePage({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward");
  
  const STEPS = [
    { id: 1, label: "Personal Information" },
    { id: 2, label: "Education & License" },
    { id: 3, label: "Specialties & Fees" },
    { id: 4, label: "Documents" },
  ];

  const goTo = (target) => {
    setDirection(target > step ? "forward" : "backward");
    setStep(target);
  };
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentType, setDocumentType] = useState("certificate");

  // ── Fetch profile from backend ─────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/doctors/me");
        setProfileData(res.data.data);
        setEditData(res.data.data);
      } catch (error) {
        if (error.response?.status === 404) {
          // No Doctor document yet — open blank edit form so they can create one
          setProfileData(null);
          setEditData({ ...EMPTY_PROFILE, fullName: currentUser?.name || "", phone: currentUser?.phone || "" });
          setIsEditing(true);
        } else {
          console.error("Failed to load doctor profile:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => { onLogout(); navigate("/"); };

  const handleEditClick = () => {
    setEditData({
      fullName: currentUser?.name || "",
      phone: currentUser?.phone || "",
      ...JSON.parse(JSON.stringify(profileData))
    });
    setStep(1);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        fullName: editData.fullName || undefined,
        phone: editData.phone || undefined,
        yearsOfExperience: editData.yearsOfExperience ? Number(editData.yearsOfExperience) : undefined,
        licenseNumber: editData.licenseNumber || undefined,
        licenseState: editData.licenseState || undefined,
        hospitalAffiliation: editData.hospitalAffiliation || undefined,
        consultationFee: editData.consultationFee ? Number(editData.consultationFee) : undefined,
        specialties: editData.specialties || [],
        bio: editData.bio || undefined,
        availableSlots: editData.availableSlots || undefined,
      };
      // Remove undefined keys so backend only updates provided fields
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const res = await api.put("/doctors/me", payload);
      const saved = res.data.data;
      setProfileData(saved);
      setEditData(saved);
      setIsEditing(false);
      alert("Profile saved successfully!");
    } catch (error) {
      alert("Failed to save: " + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profileData) {
      // First-time creation — navigating away is the only sensible cancel
      navigate("/doctor/dashboard");
    } else {
      setIsEditing(false);
      setEditData(profileData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSpecialty = (specialty) => {
    setEditData((prev) => {
      const curr = prev.specialties || [];
      return {
        ...prev,
        specialties: curr.includes(specialty)
          ? curr.filter((s) => s !== specialty)
          : [...curr, specialty],
      };
    });
  };

  // ── Document handlers (Cloudinary) ───────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setUploadError(""); setUploadSuccess("");
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) { setUploadError(validation.error); return; }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      formData.append("description", documentDescription);

      const res = await api.post("/doctors/me/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setProfileData(prev => ({ ...prev, documents: res.data.documents }));
        setUploadSuccess(`"${file.name}" uploaded to Cloud successfully!`);
        e.target.value = ""; setDocumentDescription(""); setDocumentType("certificate");
        setShowUploadForm(false);
        setTimeout(() => setUploadSuccess(""), 3000);
      }
    } catch (err) {
      setUploadError(err.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Delete this document from cloud storage?")) return;
    try {
      setSaving(true);
      const res = await api.delete(`/doctors/me/documents/${documentId}`);
      if (res.data.success) {
        setProfileData(prev => ({ ...prev, documents: res.data.documents }));
        setUploadSuccess("Document deleted from cloud.");
        setTimeout(() => setUploadSuccess(""), 3000);
      }
    } catch (err) {
      setUploadError("Failed to delete document.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadDocument = (doc) => {
    if (!doc.fileUrl) return;
    window.open(doc.fileUrl, "_blank");
  };

  // ── Loading / empty states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <p className="text-gray-600">Loading profile…</p>
      </div>
    );
  }

  // If no profile exists yet, we stay in edit mode (set in useEffect on 404)
  // so profileData === null is not a blocking render state anymore
  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      {/* Navbar */}
      <nav className="glass-panel sticky top-4 z-40 mx-4 sm:mx-6 lg:mx-8 mb-8 border-none shadow-soft backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/doctor/dashboard")}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
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

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#E5E7EB] mb-2">My Professional Profile</h1>
            <p className="text-white">View and manage your professional information</p>
          </div>
          {!isEditing && (
            <button onClick={handleEditClick} className="btn-primary flex items-center gap-2">
              <Edit className="w-4 h-4" />Edit Profile
            </button>
          )}
        </div>

        {/* Alert messages */}
        {uploadError && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{uploadError}</div>}
        {uploadSuccess && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">{uploadSuccess}</div>}

        {isEditing ? (
          // ── EDIT MODE ──────────────────────────────────────────────────────
          <div className="bg-white/95 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid md:grid-cols-[280px_1fr]">
              {/* Sidebar */}
              <aside className="bg-white border-b md:border-b-0 md:border-r border-gray-100 p-6 md:p-8">
                <div className="mb-6 hidden md:block">
                  <h1 className="text-xl font-bold text-gray-900">Professional Profile</h1>
                  <p className="text-xs text-gray-400 mt-1">Complete your information step by step.</p>
                </div>
                <RegistrationStepper steps={STEPS} currentStep={step} onStepClick={(id) => id < step && goTo(id)} />
              </aside>

              {/* Content */}
              <main className="p-6 md:p-10 lg:p-12">
                <AnimatePresence mode="wait">

                  {/* ── Step 1: Personal Information ── */}
                  {step === 1 && (
                    <FormSection key="s1" direction={direction}>
                      <div className="space-y-2">
                        <FormTile label="Personal Information" hint="Update your personal details that will be displayed on your profile.">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <TextInput label="Full Name" value={editData.fullName} onChange={(e) => setEditData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Dr. John Doe" />
                            <TextInput label="Phone Number" type="tel" value={editData.phone} onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+91 98765 43210" />
                          </div>
                        </FormTile>
                        <FormTile label="About" hint="Write a brief description about yourself and your practice.">
                          <TextArea label="About Me" value={editData.bio} onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))} placeholder="Experienced doctor specialising in..." rows={4} />
                        </FormTile>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                        <button type="button" onClick={handleCancel} className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                          Cancel
                        </button>
                        <div className="hidden sm:block flex-1"></div>
                        <div className="w-full sm:w-auto -mt-6 sm:mt-0 border-none pt-0">
                          <StepNav isFirst onNext={next} />
                        </div>
                      </div>
                    </FormSection>
                  )}

                  {/* ── Step 2: Education & License ── */}
                  {step === 2 && (
                    <FormSection key="s2" direction={direction}>
                      <div className="space-y-2">
                        <FormTile label="Experience & Education" hint="Provide details about your professional qualifications.">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <NumberInput label="Years of Experience" value={editData.yearsOfExperience} onChange={(e) => setEditData(prev => ({ ...prev, yearsOfExperience: e.target.value }))} min={0} max={60} placeholder="e.g. 15" />
                          </div>
                        </FormTile>
                        <FormTile label="License Information" hint="Your medical license details for verification.">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <TextInput label="License Number" value={editData.licenseNumber} onChange={(e) => setEditData(prev => ({ ...prev, licenseNumber: e.target.value }))} placeholder="MD-123456" />
                            <TextInput label="License State / Region" value={editData.licenseState} onChange={(e) => setEditData(prev => ({ ...prev, licenseState: e.target.value }))} placeholder="Maharashtra" />
                          </div>
                        </FormTile>
                        <FormTile label="Hospital Affiliation" hint="The hospital or clinic you are currently affiliated with.">
                          <TextInput label="Hospital Name" value={editData.hospitalAffiliation} onChange={(e) => setEditData(prev => ({ ...prev, hospitalAffiliation: e.target.value }))} placeholder="Apollo Hospitals, Mumbai" />
                        </FormTile>
                      </div>
                      <StepNav onBack={back} onNext={next} />
                    </FormSection>
                  )}

                  {/* ── Step 3: Specialties & Fees ── */}
                  {step === 3 && (
                    <FormSection key="s3" direction={direction}>
                      <div className="space-y-2">
                        <FormTile label="Select Specialties" hint="Choose the medical specialties you practice. You can select multiple.">
                          <CheckboxGrid
                            options={SPECIALTY_OPTIONS.map(s => ({ value: s, label: s }))}
                            selected={editData.specialties || []}
                            onChange={(selected) => setEditData(prev => ({ ...prev, specialties: selected }))}
                            columns={2}
                          />
                          <SpecialtyTags
                            tags={editData.specialties || []}
                            onRemove={(label) => setEditData(prev => ({ ...prev, specialties: (prev.specialties || []).filter((s) => s !== label) }))}
                            className="mt-4"
                          />
                        </FormTile>
                        <FormTile label="Consultation Fee" hint="Set your standard fee per consultation session.">
                          <NumberInput label="Fee Amount" prefix="₹" value={editData.consultationFee} onChange={(e) => setEditData(prev => ({ ...prev, consultationFee: e.target.value }))} min={0} placeholder="e.g. 800" />
                        </FormTile>
                      </div>
                      <StepNav onBack={back} onNext={next} nextLabel="Continue to Documents" />
                    </FormSection>
                  )}

                  {/* ── Step 4: Documents ── */}
                  {step === 4 && (
                    <FormSection key="s4" direction={direction}>
                      <div className="space-y-2">
                        <FormTile label="Verification Documents" hint="Upload your medical license, certificates, and other verification documents.">
                          
                          {/* Upload Form */}
                          {!showUploadForm ? (
                            <button onClick={() => setShowUploadForm(true)} className="w-full py-6 border-dashed border-2 border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-2 mb-4 hover:border-[#1F5F7A] hover:bg-[#1F5F7A]/5 transition-all text-gray-500 hover:text-[#1F5F7A]">
                              <Upload className="w-6 h-6" />
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
                                <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" id="file-input-profile" />
                                <Upload className="w-8 h-8 text-[#1F5F7A] mb-2" />
                                <p className="text-sm font-semibold text-gray-700">Click to upload file</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOC (Max 5MB)</p>
                              </label>
                              <div className="mt-4 flex justify-end">
                                <button onClick={() => { setShowUploadForm(false); setDocumentDescription(""); setDocumentType("certificate"); }} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                  Cancel Upload
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Document List */}
                          {profileData?.documents?.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-xs font-bold text-gray-500">Uploaded Documents</p>
                              {profileData.documents.map((doc) => (
                                <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xl">{getFileIcon(doc.fileType)}</span>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-gray-800 truncate">{doc.fileName}</p>
                                      <p className="text-xs text-gray-400">{formatFileSize(doc.fileSize)} · {doc.documentType}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button onClick={() => handleDownloadDocument(doc)} className="p-2 rounded-lg hover:bg-white text-primary" title="Download"><Download className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteDocument(doc._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        </FormTile>
                      </div>
                      <StepNav onBack={back} isLast onSubmit={handleSave} isSubmitting={saving} submitLabel="Save Profile" />
                    </FormSection>
                  )}

                </AnimatePresence>
              </main>
            </div>
          </div>) : (
          // ── VIEW MODE ──────────────────────────────────────────────────────
          <div className="space-y-6">
            {/* Identity card */}
            <div className="card flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold flex-shrink-0">
                {currentUser?.name?.charAt(0).toUpperCase() || "D"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark-gray">{currentUser?.name}</h2>
                <p className="text-gray-600">{currentUser?.email}</p>
                {profileData.specialty && (
                  <p className="text-primary font-semibold mt-1">{profileData.specialty}</p>
                )}
                {profileData.isVerified && (
                  <span className="badge-success mt-2 inline-block">✓ Verified</span>
                )}
              </div>
            </div>

            {/* Education & License */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">Education & License</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Years of Experience</p>
                  <p className="text-lg text-dark-gray">{profileData.yearsOfExperience ? `${profileData.yearsOfExperience} years` : "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">License Number</p>
                  <p className="text-lg text-dark-gray">{profileData.licenseNumber || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">License State</p>
                  <p className="text-lg text-dark-gray">{profileData.licenseState || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">Hospital Affiliation</p>
                  <p className="text-lg text-dark-gray">{profileData.hospitalAffiliation || "Not specified"}</p>
                </div>
              </div>
              {profileData.bio && (
                <div className="mt-6 pt-6 border-t border-border-gray">
                  <p className="text-sm text-gray-600 font-semibold mb-2">About</p>
                  <p className="text-dark-gray">{profileData.bio}</p>
                </div>
              )}
            </div>

            {/* Specialties */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">Specialties</h2>
              {profileData.specialties?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {profileData.specialties.map((s, i) => (
                    <span key={i} className="badge-primary">{s}</span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-6">No specialties listed</p>
              )}
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">Consultation Fee</p>
                <p className="text-lg text-dark-gray">
                  {profileData.consultationFee ? `₹${profileData.consultationFee} per session` : "Not specified"}
                </p>
              </div>
            </div>

            {/* Verification Documents */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark-gray">Verification Documents</h2>
                {!showUploadForm && (
                  <button onClick={() => setShowUploadForm(true)} className="btn-primary flex items-center gap-2">
                    <Upload className="w-4 h-4" />Upload Document
                  </button>
                )}
              </div>

              {showUploadForm && (
                <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-dashed border-primary">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-dark-gray mb-2">Document Type</label>
                      <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="input-field w-full">
                        <option value="certificate">Medical Certificate</option>
                        <option value="license">License</option>
                        <option value="degree">Medical Degree</option>
                        <option value="specialization">Specialization Certificate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-dark-gray mb-2">Description (optional)</label>
                      <input type="text" value={documentDescription} onChange={(e) => setDocumentDescription(e.target.value)} className="input-field w-full" placeholder="e.g., MBBS from AIIMS" />
                    </div>
                    <div className="flex items-center justify-center border-2 border-dashed border-primary rounded-lg p-6">
                      <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" id="file-input-profile" />
                      <label htmlFor="file-input-profile" className="cursor-pointer text-center">
                        <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-semibold text-dark-gray">Click to upload</p>
                        <p className="text-xs text-gray-600 mt-1">PDF, JPG, PNG, DOC (Max 5MB)</p>
                      </label>
                    </div>
                    <button onClick={() => { setShowUploadForm(false); setDocumentDescription(""); setDocumentType("certificate"); }} className="btn-secondary w-full">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {profileData.documents?.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-600 mb-4">Total: {profileData.documents.length} document(s)</p>
                  {profileData.documents.map((doc) => (
                    <div key={doc._id} className={`p-4 border rounded-lg flex items-start justify-between ${doc.verified ? "border-green-200 bg-green-50" : "border-border-gray bg-white"}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-dark-gray">{doc.fileName}</p>
                            {doc.verified && <span className="badge-success text-xs">✓ Verified</span>}
                          </div>
                          <p className="text-xs text-gray-600">{formatFileSize(doc.fileSize)} · {doc.documentType} · {new Date(doc.uploadDate).toLocaleDateString()}</p>
                          {doc.description && <p className="text-sm text-gray-600 mt-1">{doc.description}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleDownloadDocument(doc)} className="p-2 hover:bg-light-gray rounded" title="Download"><Download className="w-5 h-5 text-primary" /></button>
                        <button onClick={() => handleDeleteDocument(doc._id)} className="p-2 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-5 h-5 text-danger" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default DoctorProfilePage;
