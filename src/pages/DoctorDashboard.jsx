import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LogOut,
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  Activity,
  Video,
  Plus
} from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import { joinVideoCall } from "../utils/videoCall";
import api from "../utils/api";
import DoctorScheduleModal from "../components/DoctorScheduleModal";

function DoctorDashboard({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();


  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [urgentNotifs, setUrgentNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        // Fetch all doctor appointments
        const aptRes = await api.get("/appointments");
        const all = aptRes.data.appointments || [];

        // Filter to today's appointments
        const todayStr = new Date().toISOString().split("T")[0];
        const todayApts = all.filter((a) => {
          const aptDate = new Date(a.date).toISOString().split("T")[0];
          return aptDate === todayStr;
        });


        setTotalCount(all.length);
        setPendingCount(
          all.filter((a) => a.status === "scheduled").length
        );
        setTodayAppointments(todayApts.slice(0, 5));

        // Fetch high-priority notifications
        const notifRes = await api.get("/notifications?limit=50");
        const notifs = notifRes.data.data || notifRes.data.notifications || [];
        const urgent = notifs
          .filter(
            (n) =>
              !n.read &&
              (n.type === "refill" ||
                n.type === "appointment" ||
                n.priority === "high")
          )
          .slice(0, 3);
        setUrgentNotifs(urgent);

        // Fetch doctor profile to check completeness
        try {
          const profileRes = await api.get("/doctors/me");
          const data = profileRes.data.data;
          // Check for a critical field (licenseNumber) to determine if profile is actually complete
          // Ignore auto-generated 'PENDING-' placeholders created during signup
          const hasRealLicense = data?.licenseNumber && !data.licenseNumber.startsWith("PENDING-");
          setProfileComplete(!!data && hasRealLicense);
          setVerificationStatus(data?.verificationStatus || 'pending');
        } catch (err) {
          if (err.response?.status === 404) setProfileComplete(false);
        }
      } catch (error) {
        console.error("DoctorDashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // Listen for FAB openSchedule trigger
  useEffect(() => {
    if (searchParams.get("openSchedule") === "true") {
      setShowScheduleModal(true);
      // Clear parameter to prevent modal reopening on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("openSchedule");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const stats = [
    {
      label: "View Analytics",
      value: "Insights",
      icon: TrendingUp,
      color: "bg-blue-100",
      textColor: "text-primary",
      onClick: () => navigate("/doctor/analytics"),
    },
    {
      label: "My Schedule",
      value: "Manage",
      icon: Clock,
      color: "bg-purple-100",
      textColor: "text-purple-600",
      onClick: () => setShowScheduleModal(true),
    },
  ];

  const actions = [
    { title: "My Patients", icon: Users, to: "/doctor/patients", color: "bg-blue-50", desc: "View & manage patients" },
    { title: "Appointments", icon: Calendar, to: "/doctor/appointments", color: "bg-green-50", desc: "Schedule & consultations" },
    { title: "Drug Checker", icon: Activity, to: "/doctor/drug-checker", color: "bg-purple-50", desc: "Check interactions" },
  ];

  const statusBadge = (status) => {
    switch (status) {
      case "completed": return "badge-success";
      case "cancelled": return "badge-danger";
      case "scheduled": return "badge-primary";
      default: return "badge-primary";
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative pb-20">
      {/* Navbar */}
      <nav className="glass-panel sticky top-4 z-40 mx-4 sm:mx-6 lg:mx-8 mb-8 border-none shadow-soft backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/doctor/profile")}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold cursor-pointer transition-colors"
                  title="View Profile"
                >
                  {currentUser?.name?.charAt(0).toUpperCase() || "D"}
                </button>
                <div>
                  <p className="text-sm font-semibold text-dark-gray">
                    {currentUser?.name || "Doctor"}
                  </p>
                  <p className="text-xs text-gray-600">Doctor</p>
                </div>
              </div>
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Rejection Warning Banner */}
        {verificationStatus === 'rejected' && !loading && (
          <div className="mb-6 animate-fade-in p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-800">Profile Verification Rejected</h3>
                <p className="text-sm text-red-700">Your profile verification was rejected. Please re-upload the correct information and documents for approval.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/doctor/registration')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Update Profile
            </button>
          </div>
        )}

        {/* Profile Completion Warning */}
        {!profileComplete && !loading && (
          <div className="mb-6 animate-fade-in p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-bold text-yellow-800">Complete your professional profile</h3>
                <p className="text-sm text-yellow-700">Please provide your medical qualifications and verification documents to start consulting.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/doctor/registration')}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Complete Now
            </button>
          </div>
        )}

        {/* Features (Hidden if profile is rejected) */}
        {verificationStatus !== 'rejected' && (
          <>
            {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-[#E5E7EB] mb-2">
            Welcome, {currentUser?.name?.split(" ")[0] || "Doctor"}
          </h1>
          <p className="text-white">Here's your practice overview for today</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                onClick={stat.onClick}
                className="glass-panel p-6 animate-slide-in cursor-pointer border-none shadow-soft hover-lift group"
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl border border-white/50 ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <p className="text-gray-500 font-medium text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-extrabold text-dark-gray">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(action.to)}
                className={`glass-panel p-6 flex items-center gap-4 text-left border-none shadow-soft hover-lift group ${action.color}`}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/60 backdrop-blur border border-white/40 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark-gray text-lg">{action.title}</h3>
                  <p className="text-sm font-medium text-gray-500">{action.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
              </button>
            );
          })}
        </div>

        {/* Urgent Notifications */}
        {urgentNotifs.length > 0 && (
          <div className="mb-8 glass-panel p-6 border-none shadow-soft border-l-4 border-l-danger">
            <h2 className="text-xl font-bold text-dark-gray mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-danger" />
              Urgent Alerts
              <span className="ml-2 text-sm bg-danger text-white px-2 py-0.5 rounded-full">{urgentNotifs.length}</span>
            </h2>
            <div className="space-y-3">
              {urgentNotifs.map((notif, i) => (
                <div
                  key={notif._id || i}
                  onClick={async () => {
                    const notifId = notif._id || notif.id;
                    if (!notifId) return;
                    try {
                      // Call backend to mark read in MongoDB
                      await api.patch(`/notifications/${notifId}/read`);
                      // Remove from UI
                      setUrgentNotifs(prev => prev.filter(n => (n._id || n.id) !== notifId));
                    } catch (err) {
                      console.error("Failed to mark alert as read:", err);
                    }
                  }}
                  className="p-4 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                  title="Click to dismiss"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-dark-gray">{notif.title}</h3>
                    <span className="badge-danger text-xs">Unread</span>
                  </div>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Appointments Timeline */}
        <div className="glass-panel p-6 border-none shadow-soft hover-lift">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-dark-gray flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Today's Schedule
            </h2>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="text-primary text-sm font-semibold hover:text-primary-dark transition-colors flex items-center gap-1 bg-primary/5 px-4 py-1.5 rounded-full"
            >
              View all <ArrowRight className="w-4 h-4 border-none" />
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading appointments…</p>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white/50 backdrop-blur rounded-xl border border-dashed border-gray-300">
              <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-primary/20 ml-2 md:ml-4 py-2 space-y-6 mt-4">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="relative pl-6 md:pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-white border-2 border-primary group-hover:scale-125 transition-transform duration-300 shadow-sm z-10"></div>
                  
                  {/* Appointment Card */}
                  <div className="bg-white/80 p-4 border border-white/40 rounded-xl cursor-pointer hover:bg-blue-50/80 hover:border-blue-200 shadow-sm hover:shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark-gray text-base truncate">
                        {apt.patientName}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-sm font-medium text-gray-500">
                          <Clock className="w-4 h-4 text-primary/70" /> {apt.time}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize bg-gray-100 text-gray-600">
                          {apt.type}
                        </span>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${statusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                       {apt.status === "scheduled" && (
                         <button
                            onClick={() => navigate("/doctor/appointments")}
                            className="w-full sm:w-auto px-4 py-2 text-primary font-semibold text-sm hover:bg-blue-50 rounded-lg transition-colors border border-primary/20"
                          >
                            View Details
                         </button>
                       )}

                       {apt.type === "video" && apt.status === "scheduled" && (
                          <button
                            onClick={() => joinVideoCall(apt._id || apt.id, currentUser?.name)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#1F5F7A] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                            title="Start video call"
                          >
                            <Video className="w-4 h-4" /> Start Call
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}

        {/* Modals */}
        {showScheduleModal && (
          <DoctorScheduleModal onClose={() => setShowScheduleModal(false)} />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default DoctorDashboard;
