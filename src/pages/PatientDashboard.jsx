import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  LogOut,
  Calendar,
  Pill,
  Activity,
  AlertCircle,
  MessageSquare,
  User,
  ArrowRight
} from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";

function PatientDashboard({ onLogout, currentUser }) {
  const navigate = useNavigate();

  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const meRes = await api.get("/patients/me");
        // Profile is complete when a Patient document exists (not null)
        const patientProfile = meRes.data?.data?.profile;
        setProfileComplete(!!patientProfile);

        const aptRes = await api.get("/appointments?status=scheduled");
        const apts = aptRes.data.data || [];
        setAppointmentsCount(apts.length);
        setUpcomingAppointments(apts.slice(0, 2));

        const rxRes = await api.get("/prescriptions?status=active");
        setPrescriptionsCount(rxRes.data.prescriptions ? rxRes.data.prescriptions.length : 0);

        const notifRes = await api.get("/notifications/unread-count");
        setUnreadAlerts(notifRes.data.data.unreadCount || 0);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    }
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const stats = [
    {
      label: "Upcoming Appointments",
      value: appointmentsCount,
      icon: Calendar,
      color: "bg-blue-100",
      textColor: "text-primary",
      onClick: () => navigate("/patient/appointments")
    },
    {
      label: "Active Prescriptions",
      value: prescriptionsCount,
      icon: Pill,
      color: "bg-green-100",
      textColor: "text-success",
      onClick: () => navigate("/patient/prescriptions")
    },
    {
      label: "Health Score",
      value: "85/100", // Will be implemented in Phase 5
      icon: Activity,
      color: "bg-purple-100",
      textColor: "text-purple-600",
      onClick: () => navigate("/patient/profile#health-metrics")
    },
    {
      label: "Urgent Alerts",
      value: unreadAlerts,
      icon: AlertCircle,
      color: "bg-red-100",
      textColor: "text-danger",
      onClick: () => navigate("/patient/symptom-checker")
    },
  ];

  const actions = [
    {
      title: "Symptom Checker",
      description: "Get instant AI analysis",
      icon: Heart,
      to: "/patient/symptom-checker",
      color: "bg-blue-50",
    },
    {
      title: "Book Appointment",
      description: "Schedule with doctors",
      icon: Calendar,
      to: "/patient/appointments",
      color: "bg-green-50",
    },
    {
      title: "View Treatments",
      description: "See recommendations",
      icon: Activity,
      to: "/patient/treatment-recommendations",
      color: "bg-purple-50",
    },
    {
      title: "My Prescriptions",
      description: "View medications",
      icon: Pill,
      to: "/patient/prescriptions",
      color: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo/>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/patient/profile")}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold cursor-pointer hover:bg-blue-700 transition-colors"
                  title="View Profile"
                >
                  {currentUser?.name?.charAt(0).toUpperCase() || "P"}
                </button>
                <div>
                  <p className="text-sm font-semibold text-dark-gray">
                    {currentUser?.name || "Patient"}
                  </p>
                  <p className="text-xs text-gray-600">Patient</p>
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
        {!profileComplete && (
          <div className="mb-6 animate-fade-in p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-bold text-yellow-800">Complete your health profile</h3>
                <p className="text-sm text-yellow-700">Please provide your medical history so doctors can better assist you.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/patient/profile')}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Complete Now
            </button>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">
            Welcome back, {currentUser?.name?.split(" ")[0] || "Patient"}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your health
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                onClick={stat.onClick}
                className="card animate-slide-in cursor-pointer hover:shadow-md transition-shadow"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.color} mb-4`}
                >
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-dark-gray">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-gray mb-6">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigate(action.to)}
                  className={`card-hover p-6 text-left ${action.color}`}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-dark-gray mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 card cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/patient/appointments')}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-dark-gray">
                Upcoming Appointments
              </h3>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="p-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  No upcoming appointments booked.
                </div>
              ) : (
                upcomingAppointments.map((apt) => (
                   <div key={apt._id} className="p-4 border border-border-gray rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-dark-gray">
                          Dr. {apt.doctor?.name || "Unknown Doctor"}
                        </p>
                        <p className="text-sm text-gray-600">{apt.doctor?.specialization || "Doctor"}</p>
                      </div>
                      <span className="badge-primary">{new Date(apt.date).toLocaleDateString()} at {apt.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Health Alerts */}
          <div className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/patient/symptom-checker')}>
             <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-dark-gray">
                Health Alerts
              </h3>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {unreadAlerts === 0 ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-success">✓ All Good</p>
                  <p className="text-xs text-gray-600">No urgent alerts</p>
                </div>
              ) : (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-danger">
                    ! Attention Needed
                  </p>
                  <p className="text-xs text-gray-600">You have {unreadAlerts} unread urgent alerts.</p>
                </div>
              )}
              {prescriptionsCount > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200" onClick={(e) => { e.stopPropagation(); navigate('/patient/prescriptions'); }}>
                  <p className="text-sm font-semibold text-primary">
                    💊 Medication Reminder
                  </p>
                  <p className="text-xs text-gray-600">You have {prescriptionsCount} active prescriptions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PatientDashboard;
