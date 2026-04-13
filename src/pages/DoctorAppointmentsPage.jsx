import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  LogOut,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Search,
  Filter,
} from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";

function DoctorAppointmentsPage({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: "John Doe",
      patientEmail: "john@example.com",
      patientPhone: "+1-555-0101",
      date: "2024-03-15",
      time: "09:00 AM",
      duration: "30",
      type: "Video",
      reason: "General checkup and blood pressure monitoring",
      notes: "Patient reports occasional dizziness",
      status: "scheduled",
      reminderSent: true,
    },
    {
      id: 2,
      patientName: "Sarah Smith",
      patientEmail: "sarah@example.com",
      patientPhone: "+1-555-0102",
      date: "2024-03-15",
      time: "10:30 AM",
      duration: "45",
      type: "In-Person",
      reason: "Follow-up consultation for hypertension",
      notes: "Check recent lab results",
      status: "scheduled",
      reminderSent: true,
    },
    {
      id: 3,
      patientName: "Mike Johnson",
      patientEmail: "mike@example.com",
      patientPhone: "+1-555-0103",
      date: "2024-03-15",
      time: "11:30 AM",
      duration: "30",
      type: "Video",
      reason: "Diabetes management review",
      notes: "Review glucose monitoring results",
      status: "in-progress",
      reminderSent: true,
    },
    {
      id: 4,
      patientName: "Lisa Brown",
      patientEmail: "lisa@example.com",
      patientPhone: "+1-555-0104",
      date: "2024-03-15",
      time: "02:00 PM",
      duration: "60",
      type: "In-Person",
      reason: "Comprehensive physical examination",
      notes: "Initial appointment - full medical history",
      status: "scheduled",
      reminderSent: false,
    },
    {
      id: 5,
      patientName: "Robert Wilson",
      patientEmail: "robert@example.com",
      patientPhone: "+1-555-0105",
      date: "2024-03-14",
      time: "03:00 PM",
      duration: "30",
      type: "Video",
      reason: "Post-treatment follow-up",
      notes: "Check recovery progress",
      status: "completed",
      reminderSent: true,
    },
    {
      id: 6,
      patientName: "Emma Davis",
      patientEmail: "emma@example.com",
      patientPhone: "+1-555-0106",
      date: "2024-03-10",
      time: "04:00 PM",
      duration: "45",
      type: "In-Person",
      reason: "Medication adjustment consultation",
      notes: "Side effects reported",
      status: "completed",
      reminderSent: true,
    },
  ]);

  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    date: "",
    time: "",
    duration: "30",
    type: "Video",
    reason: "",
    notes: "",
    status: "scheduled",
  });

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "scheduled" || apt.status === "in-progress"
  );
  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );
  const cancelledAppointments = appointments.filter(
    (apt) => apt.status === "cancelled"
  );

  const filteredAppointments = () => {
    let filtered = [];
    if (activeTab === "upcoming") {
      filtered = upcomingAppointments;
    } else if (activeTab === "completed") {
      filtered = completedAppointments;
    } else if (activeTab === "cancelled") {
      filtered = cancelledAppointments;
    }

    return filtered.filter((apt) =>
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientPhone.includes(searchTerm)
    );
  };

  const handleAddAppointment = () => {
    if (
      newAppointment.patientName.trim() &&
      newAppointment.date &&
      newAppointment.time
    ) {
      const appointment = {
        id: Math.max(...appointments.map((a) => a.id), 0) + 1,
        ...newAppointment,
        reminderSent: false,
      };
      setAppointments([...appointments, appointment]);
      setNewAppointment({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        date: "",
        time: "",
        duration: "30",
        type: "Video",
        reason: "",
        notes: "",
        status: "scheduled",
      });
      setShowAddModal(false);
    }
  };

  const handleEditAppointment = (id) => {
    const appointment = appointments.find((a) => a.id === id);
    if (appointment) {
      setNewAppointment(appointment);
      setEditingId(id);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingId) {
      setAppointments(
        appointments.map((a) =>
          a.id === editingId ? { ...newAppointment, id: editingId } : a
        )
      );
      setEditingId(null);
      setShowEditModal(false);
      setNewAppointment({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        date: "",
        time: "",
        duration: "30",
        type: "Video",
        reason: "",
        notes: "",
        status: "scheduled",
      });
    }
  };

  const handleDeleteAppointment = (id) => {
    const appointment = appointments.find(a => a.id === id);
    if (appointment && appointment.status === "cancelled") {
      // Permanently delete cancelled appointments
      if (window.confirm("Are you sure you want to permanently delete this appointment?")) {
        setAppointments(appointments.filter((a) => a.id !== id));
        alert("Appointment permanently deleted.");
      }
    } else {
      // Move active appointments to cancelled
      if (window.confirm("Are you sure you want to cancel this appointment?")) {
        setAppointments(
          appointments.map((a) =>
            a.id === id ? { ...a, status: "cancelled" } : a
          )
        );
        alert("Appointment moved to cancelled section.");
      }
    }
  };

  const handleCompleteAppointment = (id) => {
    setAppointments(
      appointments.map((a) =>
        a.id === id ? { ...a, status: "completed" } : a
      )
    );
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      setAppointments(
        appointments.map((a) =>
          a.id === id ? { ...a, status: "cancelled" } : a
        )
      );
    }
  };

  const handleSendReminder = (id) => {
    setAppointments(
      appointments.map((a) =>
        a.id === id ? { ...a, reminderSent: true } : a
      )
    );
    alert("Reminder sent to patient successfully!");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "scheduled":
        return "badge-primary";
      case "in-progress":
        return "badge-warning";
      case "completed":
        return "badge-success";
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-primary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

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
                Back to Dashboard
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
            <h1 className="text-4xl font-bold text-dark-gray mb-2">
              Appointments
            </h1>
            <p className="text-gray-600">Manage your patient appointments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Appointment
          </button>
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border-gray overflow-x-auto">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === "upcoming"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === "completed"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Completed ({completedAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
              activeTab === "cancelled"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Cancelled ({cancelledAppointments.length})
          </button>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments().length > 0 ? (
            filteredAppointments().map((appointment) => (
              <div key={appointment.id} className="card">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-border-gray">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-dark-gray">
                        {appointment.patientName}
                      </h3>
                      <span className={getStatusBadgeClass(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {appointment.reason}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(appointment.status === "scheduled" ||
                      appointment.status === "in-progress") && (
                      <>
                        <button
                          onClick={() => handleEditAppointment(appointment.id)}
                          className="text-primary hover:bg-blue-100 p-2 rounded transition-colors"
                          title="Edit appointment"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {appointment.status === "in-progress" && (
                          <button
                            onClick={() =>
                              handleCompleteAppointment(appointment.id)
                            }
                            className="text-success hover:bg-green-100 p-2 rounded transition-colors"
                            title="Mark as completed"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {appointment.status === "scheduled" && (
                          <button
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                            className="text-danger hover:bg-red-100 p-2 rounded transition-colors"
                            title="Cancel appointment"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="text-danger hover:bg-red-100 p-2 rounded transition-colors"
                      title={appointment.status === "cancelled" ? "Permanently delete" : "Move to cancelled"}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Date & Time */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-gray-600">
                        Date & Time
                      </p>
                    </div>
                    <p className="text-dark-gray font-semibold">
                      {appointment.date}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.time}</p>
                  </div>

                  {/* Duration */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-gray-600">
                        Duration
                      </p>
                    </div>
                    <p className="text-dark-gray font-semibold">
                      {appointment.duration} minutes
                    </p>
                    <p className="text-sm text-gray-600">{appointment.type}</p>
                  </div>

                  {/* Contact */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      Contact Information
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {appointment.patientEmail}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {appointment.patientPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      Notes
                    </p>
                    <p className="text-sm text-gray-600 max-h-[60px] overflow-y-auto">
                      {appointment.notes || "No notes added"}
                    </p>
                  </div>
                </div>

                {/* Reminder Status */}
                <div className="flex items-center gap-4 pt-4 border-t border-border-gray">
                  <div className="flex-1 flex items-center gap-2">
                    {appointment.reminderSent ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-success" />
                        <p className="text-sm text-success">
                          Reminder sent to patient
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-warning" />
                        <p className="text-sm text-warning">
                          Reminder not sent yet
                        </p>
                      </>
                    )}
                  </div>
                  {(appointment.status === "scheduled" ||
                    appointment.status === "in-progress") &&
                    !appointment.reminderSent && (
                      <button
                        onClick={() => handleSendReminder(appointment.id)}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        Send Reminder
                      </button>
                    )}
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                No {activeTab} appointments
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {activeTab === "upcoming"
                  ? "All caught up! No upcoming appointments."
                  : `No ${activeTab} appointments to display.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Appointment Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dark-gray">
                {showEditModal ? "Edit Appointment" : "Add Appointment"}
              </h2>
              <button
                onClick={() => {
                  showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                  setEditingId(null);
                  setNewAppointment({
                    patientName: "",
                    patientEmail: "",
                    patientPhone: "",
                    date: "",
                    time: "",
                    duration: "30",
                    type: "Video",
                    reason: "",
                    notes: "",
                    status: "scheduled",
                  });
                }}
                className="text-gray-600 hover:text-primary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Patient Name */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={newAppointment.patientName}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      patientName: e.target.value,
                    })
                  }
                  className="input-field w-full"
                  placeholder="Enter patient name"
                />
              </div>

              {/* Patient Contact */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newAppointment.patientEmail}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        patientEmail: e.target.value,
                      })
                    }
                    className="input-field w-full"
                    placeholder="patient@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newAppointment.patientPhone}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        patientPhone: e.target.value,
                      })
                    }
                    className="input-field w-full"
                    placeholder="+1-555-0000"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        date: e.target.value,
                      })
                    }
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        time: e.target.value,
                      })
                    }
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Duration & Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={newAppointment.duration}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        duration: e.target.value,
                      })
                    }
                    className="input-field w-full"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">
                    Type
                  </label>
                  <select
                    value={newAppointment.type}
                    onChange={(e) =>
                      setNewAppointment({
                        ...newAppointment,
                        type: e.target.value,
                      })
                    }
                    className="input-field w-full"
                  >
                    <option value="Video">Video Consultation</option>
                    <option value="In-Person">In-Person Visit</option>
                    <option value="Phone">Phone Call</option>
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Reason for Appointment
                </label>
                <input
                  type="text"
                  value={newAppointment.reason}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      reason: e.target.value,
                    })
                  }
                  className="input-field w-full"
                  placeholder="e.g., General checkup, Follow-up consultation"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Notes
                </label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      notes: e.target.value,
                    })
                  }
                  className="input-field w-full h-24"
                  placeholder="Add any notes or special instructions"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">
                  Status
                </label>
                <select
                  value={newAppointment.status}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      status: e.target.value,
                    })
                  }
                  className="input-field w-full"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border-gray">
                <button
                  onClick={() => {
                    showAddModal
                      ? setShowAddModal(false)
                      : setShowEditModal(false);
                    setEditingId(null);
                    setNewAppointment({
                      patientName: "",
                      patientEmail: "",
                      patientPhone: "",
                      date: "",
                      time: "",
                      duration: "30",
                      type: "Video",
                      reason: "",
                      notes: "",
                      status: "scheduled",
                    });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    showEditModal ? handleSaveEdit : handleAddAppointment
                  }
                  className="btn-primary flex-1"
                >
                  {showEditModal ? "Save Changes" : "Add Appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default DoctorAppointmentsPage;
