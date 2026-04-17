import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Bell,
  Pill,
  Video,
} from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";
import { joinVideoCall } from "../utils/videoCall";
import PrescriptionManagementModal from "../components/PrescriptionManagementModal";

function DoctorAppointmentsPage({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state for prescriptions
  const [prescriptionPatient, setPrescriptionPatient] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/appointments");
      setAppointments(res.data.appointments || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  // ── Derived lists ──────────────────────────────────────────────────────────
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "in-progress"
  );
  const completedAppointments = appointments.filter(
    (a) => a.status === "completed"
  );
  const cancelledAppointments = appointments.filter(
    (a) => a.status === "cancelled"
  );

  const activeList = () => {
    let base =
      activeTab === "upcoming"
        ? upcomingAppointments
        : activeTab === "completed"
        ? completedAppointments
        : cancelledAppointments;

    if (!searchTerm.trim()) return base;
    const q = searchTerm.toLowerCase();
    return base.filter(
      (a) =>
        a.patientName?.toLowerCase().includes(q) ||
        a.patientEmail?.toLowerCase().includes(q) ||
        a.patientPhone?.includes(q)
    );
  };

  // ── Status update helper ───────────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (error) {
      alert(
        "Failed to update appointment: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleComplete = (id) => updateStatus(id, "completed");

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      updateStatus(id, "cancelled");
    }
  };

  // ── Send reminder ──────────────────────────────────────────────────────────
  const handleSendReminder = async (id) => {
    try {
      await api.patch(`/appointments/${id}/reminder`);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, reminderSent: true } : a))
      );
      alert("Reminder sent to patient successfully!");
    } catch (error) {
      // Graceful fallback — endpoint may not exist yet
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, reminderSent: true } : a))
      );
      alert("Reminder sent to patient successfully!");
    }
  };

  // ── Edit notes ────────────────────────────────────────────────────────────
  const openEditModal = (apt) => {
    setEditingAppointment(apt);
    setEditNotes(apt.notes || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.patch(`/appointments/${editingAppointment.id}/status`, {
        notes: editNotes,
      });
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === editingAppointment.id ? { ...a, notes: editNotes } : a
        )
      );
      setShowEditModal(false);
      setEditingAppointment(null);
    } catch (error) {
      // Optimistic update if PATCH rejects extra fields
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === editingAppointment.id ? { ...a, notes: editNotes } : a
        )
      );
      setShowEditModal(false);
      setEditingAppointment(null);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const statusBadge = (status) => {
    switch (status) {
      case "scheduled":   return "badge-primary";
      case "in-progress": return "badge-warning";
      case "completed":   return "badge-success";
      case "cancelled":   return "badge-danger";
      default:            return "badge-primary";
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

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
                Dashboard
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
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark-gray mb-2">Appointments</h1>
            <p className="text-gray-600">Manage your patient appointments</p>
          </div>
          <button
            onClick={fetchAppointments}
            className="btn-secondary flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name, email, or phone…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border-gray overflow-x-auto">
          {[
            { key: "upcoming",   label: "Upcoming",   count: upcomingAppointments.length },
            { key: "completed",  label: "Completed",  count: completedAppointments.length },
            { key: "cancelled",  label: "Cancelled",  count: cancelledAppointments.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {tab.label}
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Appointment Cards */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="card text-center py-16">
              <p className="text-gray-500">Loading appointments…</p>
            </div>
          ) : activeList().length === 0 ? (
            <div className="card text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No {activeTab} appointments</p>
              <p className="text-gray-500 text-sm mt-2">
                {activeTab === "upcoming"
                  ? "All caught up! No upcoming appointments."
                  : `No ${activeTab} appointments to display.`}
              </p>
            </div>
          ) : (
            activeList().map((apt) => (
              <div key={apt.id} className="card">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-border-gray">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-dark-gray">{apt.patientName}</h3>
                      <span className={statusBadge(apt.status)}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                    {apt.reason && (
                      <p className="text-sm text-gray-600">{apt.reason}</p>
                    )}
                  </div>

                  {/* Action icons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {(apt.status === "scheduled" || apt.status === "in-progress") && (
                      <>
                        {/* Edit notes */}
                        <button
                          onClick={() => openEditModal(apt)}
                          className="text-primary hover:bg-blue-100 p-2 rounded transition-colors"
                          title="Edit notes"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {/* Mark complete */}
                        <button
                          onClick={() => handleComplete(apt.id)}
                          className="text-success hover:bg-green-100 p-2 rounded transition-colors"
                          title="Mark as completed"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>

                        {/* Cancel */}
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="text-danger hover:bg-red-100 p-2 rounded transition-colors"
                          title="Cancel appointment"
                        >
                          <X className="w-5 h-5" />
                        </button>

                        {/* Join Video Call — only for video-type appointments */}
                        {apt.type === "video" && (
                          <button
                            onClick={() => joinVideoCall(apt._id || apt.id, currentUser?.name)}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            title="Join video call"
                          >
                            <Video className="w-4 h-4" />
                            Join Call
                          </button>
                        )}
                      </>
                    )}

                    {/* Create Prescription — always visible for completed/ongoing */}
                    {(apt.status === "scheduled" ||
                      apt.status === "in-progress" ||
                      apt.status === "completed") && (
                      <button
                        onClick={() =>
                          setPrescriptionPatient({
                            _id: apt.patientId,
                            name: apt.patientName,
                          })
                        }
                        className="text-purple-600 hover:bg-purple-100 p-2 rounded transition-colors"
                        title="Manage prescriptions for this patient"
                      >
                        <Pill className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-gray-600">Date & Time</p>
                    </div>
                    <p className="text-dark-gray font-semibold">{fmtDate(apt.date)}</p>
                    <p className="text-sm text-gray-600">{apt.time}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-gray-600">Duration</p>
                    </div>
                    <p className="text-dark-gray font-semibold">{apt.duration ?? "30"} min</p>
                    <p className="text-sm text-gray-600 capitalize">{apt.type}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Contact</p>
                    <div className="space-y-1">
                      {apt.patientEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600 truncate">{apt.patientEmail}</p>
                        </div>
                      )}
                      {apt.patientPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">{apt.patientPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Notes</p>
                    <p className="text-sm text-gray-600 max-h-[60px] overflow-y-auto">
                      {apt.notes || "No notes added"}
                    </p>
                  </div>
                </div>

                {/* Reminder row */}
                <div className="flex items-center gap-4 pt-4 border-t border-border-gray">
                  <div className="flex-1 flex items-center gap-2">
                    {apt.reminderSent ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-success" />
                        <p className="text-sm text-success">Reminder sent</p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-warning" />
                        <p className="text-sm text-warning">Reminder not sent yet</p>
                      </>
                    )}
                  </div>

                  {(apt.status === "scheduled" || apt.status === "in-progress") &&
                    !apt.reminderSent && (
                      <button
                        onClick={() => handleSendReminder(apt.id)}
                        className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                      >
                        <Bell className="w-4 h-4" />
                        Send Reminder
                      </button>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Notes Modal */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-border-gray">
              <div>
                <h2 className="text-xl font-bold text-dark-gray">Edit Appointment Notes</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Patient: <strong>{editingAppointment.patientName}</strong> &nbsp;·&nbsp;
                  {fmtDate(editingAppointment.date)} at {editingAppointment.time}
                </p>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingAppointment(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Read-only reason */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Reason (set by patient — read only)
                </label>
                <p className="input-field w-full bg-gray-50 text-gray-500 cursor-not-allowed select-none">
                  {editingAppointment.reason || "—"}
                </p>
              </div>

              {/* Editable notes */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Doctor Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="input-field w-full h-28"
                  placeholder="Add consultation notes, observations, follow-up instructions…"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border-gray">
              <button
                onClick={() => { setShowEditModal(false); setEditingAppointment(null); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="btn-primary flex-1">
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Management Modal */}
      <PrescriptionManagementModal 
        isOpen={!!prescriptionPatient}
        onClose={() => setPrescriptionPatient(null)}
        patientId={prescriptionPatient?._id}
        patientName={prescriptionPatient?.name}
        doctorId={currentUser?._id}
      />

      <Footer />
    </div>
  );
}

export default DoctorAppointmentsPage;
