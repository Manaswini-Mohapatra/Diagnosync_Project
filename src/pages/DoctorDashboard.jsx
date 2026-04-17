import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import { joinVideoCall } from "../utils/videoCall";
import api from "../utils/api";
import DoctorScheduleModal from "../components/DoctorScheduleModal";

function DoctorDashboard({ onLogout, currentUser }) {
  const navigate = useNavigate();


  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [urgentNotifs, setUrgentNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(true);
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
          setProfileComplete(!!profileRes.data.data);
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
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/doctor/profile")}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold cursor-pointer hover:bg-blue-700 transition-colors"
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

        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">
            Welcome, {currentUser?.name?.split(" ")[0] || "Doctor"} 👋
          </h1>
          <p className="text-gray-600">Here's your practice overview for today</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                onClick={stat.onClick}
                className="card cursor-pointer hover:shadow-md transition-shadow animate-slide-in"
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.color} mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-dark-gray">{stat.value}</p>
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
                className={`card hover:shadow-md transition-shadow p-6 flex items-center gap-4 text-left ${action.color} border border-border-gray rounded-xl`}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white shadow-sm">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark-gray text-lg">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
              </button>
            );
          })}
        </div>

        {/* Urgent Notifications */}
        {urgentNotifs.length > 0 && (
          <div className="mb-8 card border-l-4 border-danger">
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
                    try {
                      // Call backend to mark read in MongoDB
                      await api.patch(`/notifications/${notif._id}/read`);
                      // Remove from UI
                      setUrgentNotifs(prev => prev.filter(n => n._id !== notif._id));
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

        {/* Today's Appointments */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark-gray flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Today's Appointments
            </h2>
            <button
              onClick={() => navigate("/doctor/appointments")}
              className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading appointments…</p>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-gray">
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-dark-gray">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="border-b border-border-gray hover:bg-light-gray transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{apt.patientName}</td>
                      <td className="py-3 px-4 text-gray-600">{apt.time}</td>
                      <td className="py-3 px-4 capitalize text-gray-600">{apt.type}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate("/doctor/appointments")}
                            className="text-primary hover:underline text-sm font-semibold"
                          >
                            {apt.status === "scheduled" ? "View" : "Details"}
                          </button>
                          {/* Show Start Call for video appointments */}
                          {apt.type === "video" && apt.status === "scheduled" && (
                            <button
                              onClick={() => joinVideoCall(apt._id || apt.id, currentUser?.name)}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              title="Start video call"
                            >
                              <Video className="w-3 h-3" />
                              Start Call
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
