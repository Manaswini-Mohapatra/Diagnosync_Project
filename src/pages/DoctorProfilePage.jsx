import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, Edit, Save, X, Upload, Download, Trash2 } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import {
  validateFile,
  fileToBase64,
  saveDoctorDocument,
  getDoctorDocuments,
  deleteDoctorDocument,
  formatFileSize,
  getFileIcon,
} from "../utils/documentUploadHandler";

function DoctorProfilePage({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentType, setDocumentType] = useState("certificate");
  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [editDocumentType, setEditDocumentType] = useState("");
  const [editDocumentDescription, setEditDocumentDescription] = useState("");

  useEffect(() => {
    // Load doctor registration data from localStorage
    const savedData = localStorage.getItem(
      `doctorRegistration_${currentUser?.id}`
    );
    if (savedData) {
      const data = JSON.parse(savedData);
      setProfileData(data);
      setEditData(data);
    }

    // Load documents
    const documents = getDoctorDocuments(currentUser?.id);
    setUploadedDocuments(documents);

    setLoading(false);
  }, [currentUser?.id]);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleEditClick = () => {
    setEditData(JSON.parse(JSON.stringify(profileData)));
    setIsEditing(true);
  };

  const handleSave = () => {
    localStorage.setItem(
      `doctorRegistration_${currentUser?.id}`,
      JSON.stringify(editData)
    );
    setProfileData(editData);
    setIsEditing(false);
    alert("Profile updated successfully!");
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

  const handleAddSpecialty = (specialty) => {
    if (specialty && !editData.specialties.includes(specialty)) {
      setEditData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, specialty],
      }));
    }
  };

  const handleRemoveSpecialty = (index) => {
    setEditData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

  // Document Upload Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setUploadError("");
    setUploadSuccess("");

    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error);
      return;
    }

    try {
      // Convert to base64
      const base64Data = await fileToBase64(file);

      // Save to localStorage
      const result = saveDoctorDocument(currentUser?.id, {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: base64Data,
        documentType: documentType,
        description: documentDescription,
      });

      if (result.success) {
        // Update local state
        const updatedDocuments = getDoctorDocuments(currentUser?.id);
        setUploadedDocuments(updatedDocuments);
        setUploadSuccess(`Document "${file.name}" uploaded successfully!`);

        // Reset form
        e.target.value = "";
        setDocumentDescription("");
        setDocumentType("certificate");
        setShowUploadForm(false);

        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(""), 3000);
      } else {
        setUploadError("Failed to save document. Please try again.");
      }
    } catch (error) {
      setUploadError("Error processing file. Please try again.");
      console.error("Upload error:", error);
    }
  };

  // Re-upload document (replace existing)
  const handleReuploadDocument = async (e, documentId) => {
    const file = e.target.files[0];
    setUploadError("");
    setUploadSuccess("");

    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error);
      return;
    }

    try {
      // Convert to base64
      const base64Data = await fileToBase64(file);

      // Get existing document to preserve metadata
      const existingDoc = uploadedDocuments.find(doc => doc.id === documentId);

      // Delete old document
      deleteDoctorDocument(currentUser?.id, documentId);

      // Save new document with same type and description
      const result = saveDoctorDocument(currentUser?.id, {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: base64Data,
        documentType: editDocumentType || existingDoc.documentType,
        description: editDocumentDescription || existingDoc.description,
      });

      if (result.success) {
        // Update local state
        const updatedDocuments = getDoctorDocuments(currentUser?.id);
        setUploadedDocuments(updatedDocuments);
        setUploadSuccess(`Document "${file.name}" replaced successfully!`);

        // Reset form
        e.target.value = "";
        setEditingDocumentId(null);
        setEditDocumentType("");
        setEditDocumentDescription("");

        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(""), 3000);
      } else {
        setUploadError("Failed to replace document. Please try again.");
      }
    } catch (error) {
      setUploadError("Error processing file. Please try again.");
      console.error("Upload error:", error);
    }
  };

  const handleDeleteDocument = (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      const result = deleteDoctorDocument(currentUser?.id, documentId);
      if (result.success) {
        const updatedDocuments = getDoctorDocuments(currentUser?.id);
        setUploadedDocuments(updatedDocuments);
        setUploadSuccess("Document deleted successfully!");
        setTimeout(() => setUploadSuccess(""), 3000);
      } else {
        setUploadError("Failed to delete document.");
      }
    }
  };

  // Download document
  const handleDownloadDocument = (doc) => {
    try {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setUploadError("Error downloading document. Please try again.");
      console.error('Download error:', error);
    }
  };

  const specialtyOptions = [
    "Cardiologist",
    "Neurologist",
    "Dermatologist",
    "Orthopedist",
    "Pediatrician",
    "General Practitioner",
    "Psychiatrist",
    "Surgeon",
    "Ophthalmologist",
    "ENT Specialist",
  ];

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
              No profile data found. Please complete your professional profile registration.
            </p>
            <button
              onClick={() => navigate("/doctor/registration")}
              className="btn-primary"
            >
              Complete Professional Profile
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
                onClick={() => navigate("/doctor/dashboard")}
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
              My Professional Profile
            </h1>
            <p className="text-gray-600">View and manage your professional information</p>
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

        {/* Alert Messages */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {uploadSuccess}
          </div>
        )}

        {isEditing ? (
          // Edit Mode
          <div className="space-y-6">
            {/* Education & License */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Education & License
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={editData.yearsOfExperience}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={editData.licenseNumber}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">
                      License State
                    </label>
                    <input
                      type="text"
                      name="licenseState"
                      value={editData.licenseState}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark-gray mb-2">
                      Hospital Affiliation
                    </label>
                    <input
                      type="text"
                      name="hospitalAffiliation"
                      value={editData.hospitalAffiliation}
                      onChange={handleInputChange}
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Specialties & Consultation */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Specialties & Consultation
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-3">
                    Select Specialties
                  </label>
                  <div className="grid md:grid-cols-2 gap-2 mb-4">
                    {specialtyOptions.map((specialty) => (
                      <label
                        key={specialty}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={editData.specialties.includes(specialty)}
                          onChange={() => {
                            if (editData.specialties.includes(specialty)) {
                              handleRemoveSpecialty(
                                editData.specialties.indexOf(specialty)
                              );
                            } else {
                              handleAddSpecialty(specialty);
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{specialty}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {editData.specialties.map((spec, i) => (
                      <span key={i} className="badge-primary flex items-center gap-2">
                        {spec}
                        <button
                          onClick={() => handleRemoveSpecialty(i)}
                          className="text-sm font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Consultation Fee ($)
                  </label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={editData.consultationFee}
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
            {/* Education & License */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Education & License
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Years of Experience
                  </p>
                  <p className="text-lg text-dark-gray">
                    {profileData.yearsOfExperience || "Not specified"} years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">License Number</p>
                  <p className="text-lg text-dark-gray">
                    {profileData.licenseNumber || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">License State</p>
                  <p className="text-lg text-dark-gray">
                    {profileData.licenseState || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-semibold">
                    Hospital Affiliation
                  </p>
                  <p className="text-lg text-dark-gray">
                    {profileData.hospitalAffiliation || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="card">
              <h2 className="text-2xl font-bold text-dark-gray mb-6">
                Specialties
              </h2>

              {profileData.specialties?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {profileData.specialties.map((spec, i) => (
                    <span key={i} className="badge-primary">
                      {spec}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-6">No specialties listed</p>
              )}

              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">
                  Consultation Fee
                </p>
                <p className="text-lg text-dark-gray">
                  ${profileData.consultationFee || "Not specified"} per session
                </p>
              </div>
            </div>

            {/* Verification Documents Section */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark-gray">
                  Verification Documents
                </h2>
                {!showUploadForm && (
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </button>
                )}
              </div>

              {/* Upload Form */}
              {showUploadForm && (
                <div className="mb-8 p-6 bg-blue-50 rounded-lg border-2 border-dashed border-primary">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-dark-gray mb-2">
                        Document Type
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="input-field w-full"
                      >
                        <option value="certificate">Medical Certificate</option>
                        <option value="license">License</option>
                        <option value="degree">Medical Degree</option>
                        <option value="specialization">Specialization Certificate</option>
                        <option value="other">Other Document</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-dark-gray mb-2">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={documentDescription}
                        onChange={(e) => setDocumentDescription(e.target.value)}
                        className="input-field w-full"
                        placeholder="e.g., Medical degree from Harvard University"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-dark-gray mb-3">
                        Upload Document
                      </label>
                      <div className="flex items-center justify-center border-2 border-dashed border-primary rounded-lg p-6">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden"
                          id="file-input-profile"
                        />
                        <label
                          htmlFor="file-input-profile"
                          className="cursor-pointer text-center"
                        >
                          <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                          <p className="text-sm font-semibold text-dark-gray">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border-gray">
                      <button
                        onClick={() => {
                          setShowUploadForm(false);
                          setDocumentDescription("");
                          setDocumentType("certificate");
                        }}
                        className="btn-secondary flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents List */}
              {uploadedDocuments.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-600 mb-4">
                    Total Documents: {uploadedDocuments.length}
                  </p>
                  {uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-4 border rounded-lg ${
                        doc.verified
                          ? "border-green-200 bg-green-50"
                          : "border-border-gray bg-white"
                      }`}
                    >
                      {editingDocumentId === doc.id ? (
                        // Edit Mode for Document
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-dark-gray mb-2">
                              Document Type
                            </label>
                            <select
                              value={editDocumentType || doc.documentType}
                              onChange={(e) => setEditDocumentType(e.target.value)}
                              className="input-field w-full"
                            >
                              <option value="certificate">Medical Certificate</option>
                              <option value="license">License</option>
                              <option value="degree">Medical Degree</option>
                              <option value="specialization">Specialization Certificate</option>
                              <option value="other">Other Document</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-dark-gray mb-2">
                              Description
                            </label>
                            <input
                              type="text"
                              value={editDocumentDescription || doc.description}
                              onChange={(e) => setEditDocumentDescription(e.target.value)}
                              className="input-field w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-dark-gray mb-3">
                              Re-upload Document
                            </label>
                            <div className="flex items-center justify-center border-2 border-dashed border-primary rounded-lg p-4">
                              <input
                                type="file"
                                onChange={(e) => handleReuploadDocument(e, doc.id)}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                className="hidden"
                                id={`reupload-${doc.id}`}
                              />
                              <label
                                htmlFor={`reupload-${doc.id}`}
                                className="cursor-pointer text-center"
                              >
                                <Upload className="w-6 h-6 text-primary mx-auto mb-1" />
                                <p className="text-sm font-semibold text-dark-gray">
                                  Click to replace file
                                </p>
                              </label>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-border-gray">
                            <button
                              onClick={() => {
                                setEditingDocumentId(null);
                                setEditDocumentType("");
                                setEditDocumentDescription("");
                              }}
                              className="btn-secondary flex-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode for Document
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-dark-gray">
                                    {doc.fileName}
                                  </p>
                                  {doc.verified && (
                                    <span className="inline-block badge-success text-xs">
                                      ✓ Verified
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600">
                                  {formatFileSize(doc.fileSize)} • {doc.documentType} •
                                  Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                                </p>
                                {doc.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-2 hover:bg-light-gray rounded transition-colors"
                              title="Download"
                            >
                              <Download className="w-5 h-5 text-primary" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingDocumentId(doc.id);
                                setEditDocumentType(doc.documentType);
                                setEditDocumentDescription(doc.description);
                              }}
                              className="p-2 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5 text-primary" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-2 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5 text-danger" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 mb-4">
                    No documents uploaded yet. Upload your medical certificates and licenses for verification.
                  </p>
                  {!showUploadForm && (
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Your First Document
                    </button>
                  )}
                </div>
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
