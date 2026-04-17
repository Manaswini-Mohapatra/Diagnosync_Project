import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, Edit, Save, X, Upload, Download, Trash2 } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";
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
          setEditData({ ...EMPTY_PROFILE });
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
    setEditData(JSON.parse(JSON.stringify(profileData)));
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
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
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/doctor/dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />Back
              </button>
              <NotificationBell />
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <LogOut className="w-4 h-4" /><span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark-gray mb-2">My Professional Profile</h1>
            <p className="text-gray-600">View and manage your professional information</p>
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
          <div className="space-y-6">
            {/* Identity banner */}
            <div className="card bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                  {currentUser?.name?.charAt(0).toUpperCase() || "D"}
                </div>
                <div>
                  <p className="text-xl font-bold text-dark-gray">{currentUser?.name}</p>
                  <p className="text-gray-600">{currentUser?.email}</p>
                </div>
              </div>
            </div>

            {/* Education & License */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">Education & License</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">Years of Experience</label>
                    <input type="number" name="yearsOfExperience" value={editData.yearsOfExperience || ""} onChange={handleInputChange} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">License Number</label>
                    <input type="text" name="licenseNumber" value={editData.licenseNumber || ""} onChange={handleInputChange} className="input-field w-full" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">License State</label>
                    <input type="text" name="licenseState" value={editData.licenseState || ""} onChange={handleInputChange} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">Hospital Affiliation</label>
                    <input type="text" name="hospitalAffiliation" value={editData.hospitalAffiliation || ""} onChange={handleInputChange} className="input-field w-full" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">Bio / About</label>
                  <textarea name="bio" value={editData.bio || ""} onChange={handleInputChange} className="input-field w-full h-24" placeholder="Brief professional summary…" />
                </div>
              </div>
            </div>

            {/* Specialties & Fee */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">Specialties & Consultation</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-3">Select Specialties</label>
                  <div className="grid md:grid-cols-2 gap-2 mb-4">
                    {SPECIALTY_OPTIONS.map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={(editData.specialties || []).includes(s)} onChange={() => toggleSpecialty(s)} className="w-4 h-4" />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(editData.specialties || []).map((spec, i) => (
                      <span key={i} className="badge-primary flex items-center gap-2">
                        {spec}
                        <button onClick={() => toggleSpecialty(spec)} className="text-sm font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">Consultation Fee (₹)</label>
                  <input type="number" name="consultationFee" value={editData.consultationFee || ""} onChange={handleInputChange} className="input-field w-full" />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={handleCancel} className="btn-secondary flex-1">
                <X className="w-4 h-4 inline mr-2" />Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                <Save className="w-4 h-4 inline mr-2" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
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
