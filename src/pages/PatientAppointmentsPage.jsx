import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, ArrowLeft, Calendar, Clock, Video, Phone, User,
  CheckCircle, XCircle, RotateCcw, Star, Loader, AlertCircle,
  MapPin, FileText, ChevronDown, ChevronUp,
} from "lucide-react";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import Footer from "../components/Footer";
import api from "../utils/api";
import { joinVideoCall } from "../utils/videoCall";

// ── Helpers ────────────────────────────────────────────────────────────────
// An appointment is "upcoming" only if its date is still in the future
const isUpcoming = (apt) => new Date(apt.date) > new Date();

// An appointment is "overdue" when its date has passed but the doctor
// hasn't marked it completed yet — we treat it as past for display purposes
const isOverdue  = (apt) =>
  ["scheduled", "in-progress"].includes(apt.status) && new Date(apt.date) < new Date();

const typeBadge = (type) => {
  const map = {
    video:      { label: "Video",     icon: Video,  cls: "bg-blue-100 text-blue-700" },
    "in-person":{ label: "In-Person", icon: MapPin, cls: "bg-green-100 text-green-700" },
    phone:      { label: "Phone",     icon: Phone,  cls: "bg-purple-100 text-purple-700" },
  };
  return map[type] || { label: type, icon: FileText, cls: "bg-gray-100 text-gray-700" };
};

const statusBadge = (status) => {
  const map = {
    scheduled:   "bg-blue-100 text-blue-700",
    "in-progress":"bg-yellow-100 text-yellow-700",
    completed:   "bg-green-100 text-green-700",
    cancelled:   "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ── Star Rating Component ──────────────────────────────────────────────────
function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            s <= (readOnly ? value : (hovered || value))
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          } ${readOnly ? "cursor-default" : ""}`}
          onClick={() => !readOnly && onChange(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
        />
      ))}
    </div>
  );
}

// ── Appointment Card ───────────────────────────────────────────────────────
function AppointmentCard({ apt, onCancel, onReschedule, onRate, refreshing }) {
  const [expanded, setExpanded]       = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showRate, setShowRate]       = useState(false);
  const [newDate, setNewDate]         = useState("");
  const [newTime, setNewTime]         = useState("");
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const isScheduled = apt.status === "scheduled";
  const isFuture    = isUpcoming(apt);
  const overdue     = isOverdue(apt);               // scheduled but date passed
  const isCompleted = apt.status === "completed" || overdue; // treat overdue as completed
  const hasRating   = apt.rating?.score;
  const type        = typeBadge(apt.type);
  const TypeIcon    = type.icon;

  const handleReschedule = async () => {
    if (!newDate || !newTime) { setError("Please select both date and time."); return; }
    setLoading(true); setError("");
    try {
      await onReschedule(apt._id || apt.id, newDate, newTime);
      setShowReschedule(false); setNewDate(""); setNewTime("");
    } catch (e) {
      setError(e.response?.data?.error || "Reschedule failed.");
    } finally { setLoading(false); }
  };

  const handleRate = async () => {
    if (!ratingScore) { setError("Please select a rating."); return; }
    setLoading(true); setError("");
    try {
      await onRate(apt._id || apt.id, ratingScore, ratingComment);
      setShowRate(false);
    } catch (e) {
      setError(e.response?.data?.error || "Rating failed.");
    } finally { setLoading(false); }
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const timeSlots = [
    "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
    "12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM",
    "04:30 PM","05:00 PM",
  ];

  return (
    <div className="bg-white border border-border-gray rounded-xl shadow-sm overflow-hidden">
      {/* Card Header — always visible */}
      <div
        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-dark-gray text-lg leading-tight">
              Dr. {apt.doctor?.name || apt.doctorName || "Unknown"}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {apt.doctor?.specialization || "Specialist"}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Date */}
              <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                <Calendar className="w-3 h-3" /> {formatDate(apt.date)}
              </span>
              {/* Time */}
              <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" /> {apt.time}
              </span>
              {/* Type */}
              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${type.cls}`}>
                <TypeIcon className="w-3 h-3" /> {type.label}
              </span>
              {/* Status */}
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                overdue
                  ? "bg-orange-100 text-orange-700"
                  : statusBadge(apt.status)
              }`}>
                {overdue ? "Overdue" : apt.status}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 text-gray-400">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {/* Rating preview (if rated) */}
        {hasRating && (
          <div className="mt-2 flex items-center gap-2">
            <StarRating value={apt.rating.score} readOnly />
            <span className="text-xs text-gray-500">Your rating</span>
          </div>
        )}
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-border-gray bg-gray-50 p-5 space-y-4">
          {/* Reason */}
          {apt.reason && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reason</p>
              <p className="text-sm text-gray-700">{apt.reason}</p>
            </div>
          )}
          {/* Notes */}
          {apt.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Doctor's Notes</p>
              <p className="text-sm text-gray-700">{apt.notes}</p>
            </div>
          )}
          {/* Duration */}
          {apt.duration && (
            <p className="text-xs text-gray-500">Duration: {apt.duration} minutes</p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Join Video Call */}
            {apt.type === "video" && isScheduled && isFuture && (
              <button
                onClick={() => joinVideoCall(apt._id || apt.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Video className="w-4 h-4" /> Join Video Call
              </button>
            )}

            {/* Reschedule */}
            {isScheduled && isFuture && (
              <button
                onClick={() => { setShowReschedule((p) => !p); setShowRate(false); setError(""); }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {showReschedule ? "Hide" : "Reschedule"}
              </button>
            )}

            {/* Cancel */}
            {isScheduled && isFuture && (
              <button
                onClick={() => onCancel(apt._id || apt.id)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Cancel
              </button>
            )}

            {/* Rate */}
            {isCompleted && !hasRating && (
              <button
                onClick={() => { setShowRate((p) => !p); setShowReschedule(false); setError(""); }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Star className="w-4 h-4" />
                {showRate ? "Hide" : "Rate Appointment"}
              </button>
            )}

            {/* Completed label */}
            {isCompleted && hasRating && (
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" /> Rated ★{apt.rating.score}
              </span>
            )}
          </div>

          {/* ── Reschedule form ── */}
          {showReschedule && (
            <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
              <p className="text-sm font-semibold text-amber-800">Select new date & time:</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Date</label>
                  <input
                    type="date"
                    min={today}
                    max={maxDate}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="input-field w-full text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Time</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="input-field w-full text-sm"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReschedule}
                  disabled={loading}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  Confirm Reschedule
                </button>
                <button onClick={() => setShowReschedule(false)} className="btn-secondary text-sm py-2 px-4">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Rating form ── */}
          {showRate && (
            <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
              <p className="text-sm font-semibold text-yellow-800">Rate your experience:</p>
              <StarRating value={ratingScore} onChange={setRatingScore} />
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Leave a comment (optional)..."
                className="input-field w-full text-sm h-20 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRate}
                  disabled={loading || !ratingScore}
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                  Submit Rating
                </button>
                <button onClick={() => setShowRate(false)} className="btn-secondary text-sm py-2 px-4">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
function PatientAppointmentsPage({ onLogout, currentUser }) {
  const navigate  = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [refreshing, setRefreshing]     = useState(false);
  const [activeTab, setActiveTab]       = useState("upcoming");

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data.appointments || []);
    } catch (e) {
      setError("Failed to load appointments. Please refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleLogout = () => { onLogout(); navigate("/"); };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    setRefreshing(true);
    try {
      await api.patch(`/appointments/${id}/status`, { status: "cancelled" });
      await fetchAppointments();
    } catch (e) {
      alert(e.response?.data?.error || "Cancel failed.");
      setRefreshing(false);
    }
  };

  const handleReschedule = async (id, date, time) => {
    await api.patch(`/appointments/${id}/reschedule`, { date, time });
    await fetchAppointments();
  };

  const handleRate = async (id, score, comment) => {
    await api.patch(`/appointments/${id}/rate`, { score, comment });
    await fetchAppointments();
  };

  // ── Tab filtering ──────────────────────────────────────────────────────
  // Rule: a scheduled/in-progress appointment whose date has already passed
  // automatically appears in "Past" regardless of its DB status.
  const now = new Date();
  const tabs = {
    upcoming:  appointments.filter((a) =>
      ["scheduled","in-progress"].includes(a.status) && new Date(a.date) >= now
    ),
    past: appointments.filter((a) =>
      a.status === "completed" ||
      (["scheduled","in-progress"].includes(a.status) && new Date(a.date) < now)
    ),
    cancelled: appointments.filter((a) => a.status === "cancelled"),
  };

  const tabConfig = [
    { key: "upcoming",  label: "Upcoming",  count: tabs.upcoming.length },
    { key: "past",      label: "Past",      count: tabs.past.length },
    { key: "cancelled", label: "Cancelled", count: tabs.cancelled.length },
  ];

  const displayed = tabs[activeTab] || [];

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/patient/dashboard")}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Dashboard
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

      {/* Page Body */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-dark-gray">My Appointments</h1>
            <p className="text-gray-500 mt-1">All your appointments with DiagnoSync doctors</p>
          </div>
          <button
            onClick={() => navigate("/patient/appointments")}
            className="btn-primary flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" /> Book New
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-white shadow text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-primary text-white" : "bg-gray-300 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {activeTab === "upcoming"
                ? "No upcoming appointments. Book one now!"
                : activeTab === "past"
                ? "No past appointments yet."
                : "No cancelled appointments."}
            </p>
            {activeTab === "upcoming" && (
              <button
                onClick={() => navigate("/patient/appointments")}
                className="btn-primary mt-4"
              >
                Book Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((apt) => (
              <AppointmentCard
                key={apt._id || apt.id}
                apt={apt}
                onCancel={handleCancel}
                onReschedule={handleReschedule}
                onRate={handleRate}
                refreshing={refreshing}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default PatientAppointmentsPage;
