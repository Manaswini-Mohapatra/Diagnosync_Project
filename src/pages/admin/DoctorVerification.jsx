import React, { useState, useEffect } from "react";
import { Activity, Users, FileCheck, LogOut, Loader, CheckCircle, XCircle, FileText, Calendar, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Logo from "../../components/Logo";

function DoctorVerification({ onLogout }) {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    setIsLoading(true);
    try {
      // For now we get all doctors and filter pending, or backend could add ?verificationStatus=pending
      // Assuming backend returns isVerified field, but we need verificationStatus. 
      // We will fetch all and filter for now as a simple implementation.
      const res = await api.get('/doctors?limit=100');
      
      // Filter for verificationStatus 'pending' to match the dashboard stats exactly
      const pending = res.data.doctors.filter(d => d.verificationStatus === 'pending');
      setDoctors(pending);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (doctorId, status) => {
    setActionLoading(doctorId);
    try {
      const res = await api.patch(`/doctors/${doctorId}/verify`, { status });
      if (res.data.success) {
        setDoctors(doctors.filter(d => d.id !== doctorId));
      }
    } catch (error) {
      console.error(`Error updating verification to ${status}`, error);
      alert(`Failed to update verification status.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200 overflow-hidden">
          <Logo size="small" clickable={false} />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <Activity className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <Users className="w-5 h-5" /> User Management
          </Link>
          <Link to="/admin/appointments" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <Calendar className="w-5 h-5" /> Appointments
          </Link>
          <Link to="/admin/doctors/verify" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary font-semibold rounded-xl transition-colors">
            <FileCheck className="w-5 h-5" /> Verifications
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={() => { onLogout(); navigate('/signin'); }} className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-red-50 font-medium rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10 overflow-hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 text-gray-600 hover:text-primary rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <Logo size="small" clickable={false} />
          </div>
          <button onClick={() => { onLogout(); navigate('/signin'); }} className="p-2 text-danger hover:bg-red-50 rounded-lg shrink-0">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 md:hidden flex flex-col"
              >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <Logo size="small" clickable={false} />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
                    <Activity className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link to="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
                    <Users className="w-5 h-5" /> User Management
                  </Link>
                  <Link to="/admin/appointments" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
                    <Calendar className="w-5 h-5" /> Appointments
                  </Link>
                  <Link to="/admin/doctors/verify" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary font-semibold rounded-xl transition-colors">
                    <FileCheck className="w-5 h-5" /> Verifications
                  </Link>
                </nav>
                <div className="p-4 border-t border-gray-200">
                  <button onClick={() => { onLogout(); navigate('/signin'); }} className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-red-50 font-medium rounded-xl transition-colors">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-gray">Doctor Verifications</h1>
            <p className="text-gray-500 mt-1">Review and approve new doctor registrations.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center shadow-soft">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-dark-gray mb-2">All Caught Up!</h3>
              <p className="text-gray-500">There are no pending doctor verifications at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {doctors.map(doctor => (
                <div key={doctor.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    
                    {/* Doctor Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                          {doctor.name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-dark-gray">{doctor.name}</h3>
                          <p className="text-primary font-medium">{doctor.specialty}</p>
                          <p className="text-gray-500 text-sm mt-1">{doctor.email} • {doctor.phone}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">License Number</p>
                          <p className="font-medium text-dark-gray">{doctor.licenseNumber || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">License State</p>
                          <p className="font-medium text-dark-gray">{doctor.licenseState || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Experience</p>
                          <p className="font-medium text-dark-gray">{doctor.yearsOfExperience ? `${doctor.yearsOfExperience} Years` : 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Hospital Affiliation</p>
                          <p className="font-medium text-dark-gray">{doctor.hospitalAffiliation || 'None'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Documents & Actions */}
                    <div className="w-full md:w-72 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <div>
                        <p className="text-sm font-semibold text-dark-gray mb-3">Uploaded Documents</p>
                        {doctor.documents && doctor.documents.length > 0 ? (
                          <div className="space-y-2 mb-6">
                            {doctor.documents.map((doc, idx) => (
                              <a 
                                key={idx} 
                                href={doc.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-primary hover:text-primary transition-colors text-sm text-gray-600"
                              >
                                <FileText className="w-4 h-4" />
                                <span className="truncate">{doc.documentType || 'Document'}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg mb-6">No documents uploaded.</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(doctor.id, 'rejected')}
                          disabled={actionLoading === doctor.id}
                          className="flex-1 py-2 px-3 border border-danger text-danger hover:bg-red-50 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          {actionLoading === doctor.id ? <Loader className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4" /> Reject</>}
                        </button>
                        <button
                          onClick={() => handleVerify(doctor.id, 'verified')}
                          disabled={actionLoading === doctor.id}
                          className="flex-1 py-2 px-3 bg-green-500 text-white hover:bg-green-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          {actionLoading === doctor.id ? <Loader className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Approve</>}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DoctorVerification;
