import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, LogOut, ArrowLeft, CheckCircle, Upload, X, Download, Eye, Edit, Trash2 } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import {
  validateFile,
  fileToBase64,
  saveDoctorDocument,
  getDoctorDocuments,
  deleteDoctorDocument,
  formatFileSize,
  getFileIcon,
} from "../utils/documentUploadHandler";

function DoctorRegistrationForm({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    yearsOfExperience: "",
    licenseNumber: "",
    licenseState: "",
    hospitalAffiliation: "",
    consultationFee: "",
    specialties: [],
    qualifications: [],
    languages: [],
  });
  const [uploadedDocuments, setUploadedDocuments] = useState(
    getDoctorDocuments(currentUser?.id) || []
  );
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentType, setDocumentType] = useState("certificate");
  const [editingDocumentId, setEditingDocumentId] = useState(null);
  const [editDocumentType, setEditDocumentType] = useState("");
  const [editDocumentDescription, setEditDocumentDescription] = useState("");

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

  const handleAddSpecialty = (specialty) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, specialty],
      }));
    }
  };

  const handleRemoveSpecialty = (index) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

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

  const handleSubmit = () => {
    // Save to localStorage
    localStorage.setItem(
      `doctorRegistration_${currentUser?.id}`,
      JSON.stringify(formData),
    );
    setIsSubmitted(true);
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-light-gray">
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Logo/>
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
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">
              Profile Created!
            </h1>
            <p className="text-gray-600 mb-4">
              Your professional information has been saved successfully.
            </p>
            {uploadedDocuments.length > 0 && (
              <p className="text-gray-600 mb-8">
                {uploadedDocuments.length} document(s) uploaded for verification.
              </p>
            )}
            <button
              onClick={() => navigate("/doctor/dashboard")}
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
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo/>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/doctor/dashboard")}
                className="flex items-center gap-2 text-gray-600 hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-dark-gray mb-2">
          Doctor Profile Registration
        </h1>
        <p className="text-gray-600 mb-8">
          Complete your medical qualifications and upload verification documents
        </p>

        {step === 1 && (
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
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="MD-123456"
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
                    value={formData.licenseState}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Hospital Affiliation
                  </label>
                  <input
                    type="text"
                    name="hospitalAffiliation"
                    value={formData.hospitalAffiliation}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="St. Luke's Hospital"
                  />
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

        {step === 2 && (
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
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => {
                          if (formData.specialties.includes(specialty)) {
                            handleRemoveSpecialty(
                              formData.specialties.indexOf(specialty),
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
                  {formData.specialties.map((spec, i) => (
                    <span key={i} className="badge-primary">
                      {spec}
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
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="100"
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
                  Continue to Documents
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">
              Upload Verification Documents
            </h2>

            <p className="text-gray-600 mb-6">
              Upload your medical certificates, licenses, or degrees to verify your credentials.
            </p>

            {/* Alerts */}
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

            {/* Document Upload Section */}
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
                      id="file-input"
                    />
                    <label
                      htmlFor="file-input"
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
              </div>
            </div>

            {/* Uploaded Documents List */}
            {uploadedDocuments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-dark-gray mb-4">
                  Uploaded Documents ({uploadedDocuments.length})
                </h3>
                <div className="space-y-3">
                  {uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 border border-border-gray rounded-lg"
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
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
                              <div>
                                <p className="font-semibold text-dark-gray">{doc.fileName}</p>
                                <p className="text-xs text-gray-600">
                                  {formatFileSize(doc.fileSize)} • {doc.documentType} • Uploaded{" "}
                                  {new Date(doc.uploadDate).toLocaleDateString()}
                                </p>
                                {doc.description && (
                                  <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
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
                              <X className="w-5 h-5 text-danger" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border-gray">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button onClick={handleSubmit} className="btn-success flex-1">
                Complete Registration
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}

export default DoctorRegistrationForm;
