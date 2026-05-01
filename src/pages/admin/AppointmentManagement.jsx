import React, { useState, useEffect } from "react";
import { Users, Activity, FileCheck, LogOut, Search, Calendar as CalendarIcon, Loader, Video, User, CheckCircle, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Logo from "../../components/Logo";

function AppointmentManagement({ onLogout }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, page]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) query.append('status', statusFilter);
      
      const res = await api.get(`/appointments?${query.toString()}`);
      setAppointments(res.data.appointments);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    
    setActionLoading(id);
    try {
      // Admins can delete or cancel. We'll use the delete endpoint which acts as a soft-cancel or hard-delete depending on role and current status.
      // Since it's an admin, DELETE /api/appointments/:id acts as a hard delete if already cancelled, or soft cancel if active.
      const res = await api.delete(`/appointments/${id}`);
      if (res.data.success) {
        // If it was cancelled, update locally. If permanently deleted, remove from list.
        if (res.data.message === 'Appointment cancelled') {
          setAppointments(appointments.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
        } else {
          setAppointments(appointments.filter(a => a._id !== id));
        }
      }
    } catch (error) {
      console.error("Error managing appointment", error);
      alert("Failed to cancel appointment.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200 overflow-hidden">
          <Logo size="small" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <Activity className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <Users className="w-5 h-5" /> User Management
          </Link>
          <Link to="/admin/doctors/verify" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <FileCheck className="w-5 h-5" /> Verifications
          </Link>
          <Link to="/admin/appointments" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary font-semibold rounded-xl transition-colors">
            <CalendarIcon className="w-5 h-5" /> Appointments
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
          <Logo size="small" />
        </header>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-gray">Appointment Management</h1>
            <p className="text-gray-500 mt-1">Monitor and manage platform appointments.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by patient or doctor name..." 
                  className="input-field pr-10 bg-gray-50 border-transparent focus:bg-white focus:border-primary w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="input-field bg-gray-50 border-transparent focus:bg-white focus:border-primary sm:w-48"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In-Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Patient</th>
                    <th className="pb-3 font-medium">Doctor</th>
                    <th className="pb-3 font-medium">Date & Time</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {isLoading ? (
                    <tr><td colSpan="6" className="py-8 text-center text-gray-500"><Loader className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading appointments...</td></tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr><td colSpan="6" className="py-8 text-center text-gray-500">No appointments found.</td></tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 font-medium text-dark-gray">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {apt.patientName}
                          </div>
                        </td>
                        <td className="py-4 font-medium text-gray-700">Dr. {apt.doctorName}</td>
                        <td className="py-4 text-gray-600">
                          {new Date(apt.date).toLocaleDateString()} at {apt.time}
                        </td>
                        <td className="py-4">
                          <span className={`flex items-center w-fit gap-1 text-xs px-2 py-0.5 rounded-full font-bold capitalize ${
                                apt.type === "video" ? "bg-blue-100 text-blue-700" :
                                apt.type === "in-person" ? "bg-green-100 text-green-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                            {apt.type === 'video' ? <Video className="w-3 h-3" /> : null}
                            {apt.type}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${
                            apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleCancelAppointment(apt._id)}
                            disabled={actionLoading === apt._id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                              apt.status === 'cancelled' 
                                ? 'border-red-500 text-red-600 hover:bg-red-50' 
                                : 'border-red-300 text-red-500 hover:bg-red-50'
                            }`}
                            title={apt.status === 'cancelled' ? "Permanently Delete" : "Cancel Appointment"}
                          >
                            {actionLoading === apt._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 
                             apt.status === 'cancelled' ? 'Delete' : 'Cancel'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AppointmentManagement;
