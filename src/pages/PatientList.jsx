import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, LogOut, Search, Filter, ArrowLeft, X, MessageSquare, AlertCircle } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";

function PatientList({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Modal state for View Details
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleLogout = () => { onLogout(); navigate("/"); };

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    fetchPatients();
  }, [page, searchTerm]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/patients?page=${page}&limit=10&search=${searchTerm}`);
      if (res.data.success) {
        setPatients(res.data.patients || []);
        setTotalPages(res.data.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAge = (patient) => {
    if (patient.profile?.dateOfBirth) {
      const diff = Date.now() - new Date(patient.profile.dateOfBirth).getTime();
      return Math.abs(new Date(diff).getUTCFullYear() - 1970);
    }
    return patient.profile?.age || "N/A";
  };

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/doctor/dashboard")} className="text-gray-600 hover:text-primary transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <NotificationBell />
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
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
          <h1 className="text-4xl font-bold text-dark-gray mb-2">My Patients</h1>
          <p className="text-gray-600">Browse and manage registered patients.</p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading patients...</div>
          ) : patients.length > 0 ? (
            patients.map((patient) => (
              <div key={patient._id} className="card-hover p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-dark-gray">{patient.name}</h3>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Age</p>
                        <p className="font-semibold text-dark-gray">{getAge(patient)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Gender</p>
                        <p className="font-semibold text-dark-gray capitalize">{patient.profile?.gender || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Blood</p>
                        <p className="font-semibold text-dark-gray uppercase">{patient.profile?.bloodType || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Pre-existing</p>
                        <p className="font-semibold text-dark-gray truncate">
                          {patient.profile?.medicalConditions?.length ? patient.profile.medicalConditions.join(', ') : 'None'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedPatient(patient)}
                      className="btn-primary text-sm px-4 py-2 h-[40px]"
                    >
                      View Profile
                    </button>
                    {/* Share with Doctor disabled as per Phase 4.6 note, messaging deferred */}
                    <div className="group relative">
                       <button className="btn-secondary text-sm px-4 py-2 opacity-50 cursor-not-allowed flex items-center gap-2 h-[40px]">
                         <MessageSquare className="w-4 h-4" /> Message
                       </button>
                       <span className="absolute bottom-full mb-2 left-1/2 min-w-[200px] -translate-x-1/2 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                         Messaging system is slated for future release.
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">No patients found</p>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'There are no active patients registered.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="text-gray-600 font-medium">Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Patient Profile Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-dark-gray flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
                  {selectedPatient.name.charAt(0).toUpperCase()}
                </div>
                {selectedPatient.name}'s Medical Profile
              </h2>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold text-dark-gray border-b pb-2 mb-3">Contact Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Email</label>
                    <p className="text-dark-gray">{selectedPatient.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Phone</label>
                    <p className="text-dark-gray">{selectedPatient.phone || "Not provided"}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-gray-500">Address</label>
                    <p className="text-dark-gray">{selectedPatient.profile?.address || "Not provided"}</p>
                  </div>
                  {selectedPatient.profile?.emergencyContact && (
                     <div className="col-span-2 bg-red-50 p-3 rounded border border-red-100 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <label className="text-sm font-bold text-red-700">Emergency Contact</label>
                          <p className="text-red-900">{selectedPatient.profile.emergencyContact} — {selectedPatient.profile.emergencyPhone || 'No number'}</p>
                        </div>
                     </div>
                  )}
                </div>
              </div>

              {/* Patient Vitals & Demographics */}
               <div>
                <h3 className="text-lg font-bold text-dark-gray border-b pb-2 mb-3">Vitals & Demographics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <label className="text-xs font-bold text-gray-500 uppercase">Blood</label>
                    <p className="font-semibold text-lg">{selectedPatient.profile?.bloodType || "--"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <label className="text-xs font-bold text-gray-500 uppercase">Age</label>
                    <p className="font-semibold text-lg">{getAge(selectedPatient)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                    <p className="font-semibold text-lg capitalize">{selectedPatient.profile?.gender || "--"}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <label className="text-xs font-bold text-gray-500 uppercase">Height/Weight</label>
                    <p className="font-semibold text-lg">
                      {selectedPatient.profile?.height ? `${selectedPatient.profile.height} cm` : '--'} / {selectedPatient.profile?.weight ? `${selectedPatient.profile.weight} kg` : '--'}
                    </p>
                  </div>
                </div>
              </div>

               {/* Clinical History */}
               <div>
                <h3 className="text-lg font-bold text-dark-gray border-b pb-2 mb-3">Clinical History</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500 block mb-1">Pre-existing Medical Conditions</label>
                    {selectedPatient.profile?.medicalConditions?.length > 0 ? (
                       <div className="flex flex-wrap gap-2">
                         {selectedPatient.profile.medicalConditions.map((cond, i) => (
                           <span key={i} className="bg-blue-50 text-primary border border-blue-200 px-3 py-1 rounded-full text-sm">{cond}</span>
                         ))}
                       </div>
                    ) : (
                      <p className="text-dark-gray">None reported</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-500 block mb-1">Allergies</label>
                     {selectedPatient.profile?.allergies?.length > 0 ? (
                       <div className="flex flex-wrap gap-2">
                         {selectedPatient.profile.allergies.map((allergy, i) => (
                           <span key={i} className="bg-red-50 text-danger border border-red-200 px-3 py-1 rounded-full text-sm">{allergy}</span>
                         ))}
                       </div>
                    ) : (
                      <p className="text-dark-gray">No known allergies</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-500 block mb-1">Current Medications</label>
                     {selectedPatient.profile?.medications?.length > 0 ? (
                       <ul className="list-disc pl-5 text-dark-gray">
                         {selectedPatient.profile.medications.map((med, i) => (
                           <li key={i}>{med}</li>
                         ))}
                       </ul>
                    ) : (
                      <p className="text-dark-gray">None reported</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default PatientList;
