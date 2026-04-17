import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, Upload, FileText, AlertCircle, Loader2, ExternalLink, Trash2 } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";

function PatientReports({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/patients/me");
      const profile = res.data?.data?.profile;
      if (profile?.reports) {
        setReports(profile.reports);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError("File size exceeds 5MB limit.");
        setFile(null);
        e.target.value = null; // reset
        return;
      }
      setUploadError("");
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setUploadError("Please provide both a title and a file.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("report", file);

    try {
      const res = await api.post("/patients/me/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setUploadSuccess("Report uploaded successfully!");
        setTitle("");
        setFile(null);
        // Reset file input visually if needed
        document.getElementById("report-upload").value = "";
        // Refresh list immediately
        fetchReports();
        
        setTimeout(() => setUploadSuccess(""), 5000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.response?.data?.error || "Failed to upload report.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to permanently delete this report?")) return;
    
    try {
      setUploadError("");
      setUploadSuccess("");
      const res = await api.delete(`/patients/me/reports/${reportId}`);
      if (res.data.success) {
        setUploadSuccess("Report deleted successfully.");
        // Refresh the list
        fetchReports();
        setTimeout(() => setUploadSuccess(""), 5000);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setUploadError("Failed to delete report.");
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/patient/dashboard")}
                className="text-gray-600 hover:text-primary transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">My Reports</h1>
          <p className="text-gray-600">Upload and manage your medical test reports securely.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* File Upload Section */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold text-dark-gray mb-4">Upload New Report</h2>
              
              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
              
              {uploadSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
                  {uploadSuccess}
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-1">Report Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Complete Blood Count (CBC)"
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                   <label className="block text-sm font-semibold text-dark-gray mb-1">File (PDF or Image)</label>
                   <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                     <input
                       type="file"
                       id="report-upload"
                       onChange={handleFileChange}
                       accept="image/*,application/pdf"
                       className="hidden"
                     />
                     <label htmlFor="report-upload" className="cursor-pointer text-center w-full">
                       <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                       <span className="text-sm font-semibold text-primary block">
                         {file ? file.name : "Click to select a file"}
                       </span>
                       <span className="text-xs text-gray-500 mt-1 block">Max size: 5MB</span>
                     </label>
                   </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !file || !title}
                  className="btn-primary w-full flex justify-center items-center gap-2"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    "Upload Report"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Reports Grid Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-dark-gray mb-4">Your Uploaded Reports</h2>
            
             {isLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  Loading your reports...
                </div>
             ) : reports.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {reports.map((report, idx) => (
                    <div key={report._id || idx} className="card-hover p-4 flex flex-col justify-between">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-dark-gray line-clamp-2" title={report.title}>{report.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(report.uploadedAt).toLocaleDateString()} • {report.fileType.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={report.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-secondary flex-1 text-center text-sm flex justify-center items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" /> View
                        </a>
                        <button
                          onClick={() => handleDeleteReport(report._id)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="card text-center py-12 border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-gray mb-1">No reports yet</h3>
                  <p className="text-gray-500">Upload your first medical report using the form.</p>
                </div>
             )}
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PatientReports;
