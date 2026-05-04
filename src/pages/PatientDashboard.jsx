import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, LogOut, Calendar, Pill, Activity, AlertCircle,
  MessageSquare, User, ArrowRight, Video, Clock, X, MapPin, Phone, FileText, Plus
} from "lucide-react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import { joinVideoCall } from "../utils/videoCall";
import api from "../utils/api";

function PatientDashboard({ onLogout, currentUser }) {
  const navigate = useNavigate();

  const [totalAppointments, setTotalAppointments]     = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);  // 24-72hr window
  const [reportsCount, setReportsCount]               = useState(0);
  const [unreadAlerts, setUnreadAlerts]               = useState(0);
  const [profileComplete, setProfileComplete]         = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null); // detail modal
  const [healthScoreData, setHealthScoreData]         = useState(null);
  const [showHealthModal, setShowHealthModal]         = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const meRes = await api.get("/patients/me");
        const profile = meRes.data?.data?.profile;
        // Profile is complete if it exists AND has some basic info filled (like age)
        setProfileComplete(!!profile && profile.age != null);
        if (profile?.healthScore) setHealthScoreData(profile.healthScore);
        if (profile?.reports) setReportsCount(profile.reports.length);

        // Total count (all scheduled) for stat card
        const totalRes = await api.get("/appointments?status=scheduled");
        setTotalAppointments(totalRes.data.total || 0);

        // 24-72hr window for dashboard widget
        const windowRes = await api.get("/appointments?upcoming=true&hours=72");
        setUpcomingAppointments(windowRes.data.appointments || []);

        const notifRes = await api.get("/notifications/unread-count");
        setUnreadAlerts(notifRes.data.data?.unreadCount || 0);
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

  // Determine Color for Health Status
  let healthScoreColor = "bg-purple-100 text-purple-600";
  if (healthScoreData?.status === "Good") healthScoreColor = "bg-green-100 text-green-700";
  else if (healthScoreData?.status === "Moderate") healthScoreColor = "bg-yellow-100 text-yellow-700";
  else if (healthScoreData?.status === "Critical") healthScoreColor = "bg-red-100 text-red-700";

  const stats = [
    {
      label: "My Appointments",
      value: totalAppointments,
      icon: Calendar,
      color: "bg-blue-100",
      textColor: "text-primary",
      onClick: () => navigate("/patient/my-appointments")
    },
    {
      label: "My Reports",
      value: reportsCount,
      icon: FileText,
      color: "bg-blue-50",
      textColor: "text-blue-600",
      onClick: () => navigate("/patient/reports")
    },
    {
      label: "Health Status",
      value: (healthScoreData?.status && healthScoreData?.status !== "None") ? healthScoreData.status : "N/A",
      icon: Activity,
      color: healthScoreColor.split(' ')[0],
      textColor: healthScoreColor.split(' ')[1],
      onClick: () => { if (healthScoreData?.status && healthScoreData?.status !== "None") setShowHealthModal(true); else navigate('/patient/profile'); }
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
    <div className="min-h-screen bg-transparent relative pb-20">
      {/* Navbar */}
      <nav className="glass-panel sticky top-4 z-40 mx-4 sm:mx-6 lg:mx-8 mb-8 border-none shadow-soft backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo/>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/patient/profile")}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold cursor-pointer transition-colors"
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
              onClick={() => navigate('/patient/registration')}
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            const isHealthScore = stat.label === "Health Status";
            const scoreValue = healthScoreData?.score || 0;
            const pathColor = scoreValue >= 80 ? '#15803d' : scoreValue >= 50 ? '#a16207' : '#b91c1c';

            return (
              <div
                key={i}
                onClick={stat.onClick}
                className="glass-panel p-6 animate-slide-in cursor-pointer hover-lift border-none shadow-soft group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl border border-white/50 ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <p className="text-gray-500 font-medium text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-extrabold text-dark-gray">
                      {stat.value}
                    </p>
                  </div>
                  {isHealthScore && scoreValue > 0 && (
                    <div className="w-20 h-20 drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <CircularProgressbar
                        value={scoreValue}
                        text={`${scoreValue}`}
                        strokeWidth={10}
                        styles={buildStyles({
                          pathColor: pathColor,
                          textColor: '#1f2937',
                          trailColor: 'rgba(0,0,0,0.05)',
                          textSize: '28px',
                          pathTransitionDuration: 1.5,
                        })}
                      />
                    </div>
                  )}
                </div>
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
                  className={`glass-panel p-6 text-left border-none shadow-soft hover-lift group ${action.color}`}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/60 backdrop-blur border border-white/40 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-dark-gray mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments Timeline */}
          <div className="lg:col-span-2 glass-panel p-6 border-none shadow-soft hover-lift">
            <div
              className="flex justify-between items-center mb-4 cursor-pointer"
              onClick={() => navigate('/patient/my-appointments')}
            >
              <div>
                <h3 className="text-lg font-bold text-dark-gray">Health Journey</h3>
                <p className="text-xs text-gray-500 mt-0.5">Upcoming schedule in the next 72 hours</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="relative border-l-2 border-primary/20 ml-2 md:ml-4 py-2 space-y-6 mt-4">
              {upcomingAppointments.length === 0 ? (
                <div className="relative pl-6 md:pl-8">
                  <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 border-2 border-white"></div>
                  <div className="p-4 bg-white/50 backdrop-blur rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
                    <Calendar className="w-5 h-5 mr-2 text-gray-300" />
                    <p className="text-sm font-medium">No appointments currently scheduled.</p>
                  </div>
                </div>
              ) : (
                upcomingAppointments.map((apt) => {
                  const aptDate = new Date(apt.date);
                  if (apt.time) {
                    const match = apt.time.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
                    if (match) {
                      let hours = parseInt(match[1], 10);
                      const mins = parseInt(match[2], 10);
                      const modifier = match[3]?.toUpperCase();
                      if (modifier === 'PM' && hours < 12) hours += 12;
                      if (modifier === 'AM' && hours === 12) hours = 0;
                      aptDate.setHours(hours, mins, 0, 0);
                    }
                  }
                  const diffHrs = Math.round((aptDate - Date.now()) / 3600000);
                  const timeLabel = diffHrs < 1 ? "Very soon" : diffHrs < 24 ? `in ${diffHrs}h` : `in ${Math.round(diffHrs/24)}d`;
                  
                  return (
                    <div key={apt._id || apt.id} className="relative pl-6 md:pl-8 group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-white border-2 border-primary group-hover:scale-125 transition-transform duration-300 shadow-sm z-10"></div>
                      
                      {/* Card Content */}
                      <div
                        className="bg-white/80 p-4 border border-white/40 rounded-xl cursor-pointer hover:bg-blue-50/80 hover:border-blue-200 shadow-sm hover:shadow-soft transition-all"
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-dark-gray text-sm md:text-base truncate">
                              Dr. {apt.doctor?.name || apt.doctorName || "Unknown"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                <Clock className="w-3.5 h-3.5 text-primary/70" /> {apt.time}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${
                                apt.type === "video" ? "bg-blue-100 text-blue-700" :
                                apt.type === "in-person" ? "bg-green-100 text-green-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>{apt.type}</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex-shrink-0">
                            {timeLabel}
                          </span>
                        </div>
                        {apt.type?.toLowerCase() === "video" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); joinVideoCall(apt._id || apt.id, currentUser?.name); }}
                            className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-[#1F5F7A] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            <Video className="w-4 h-4" /> Join Video Call
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Health Alerts */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-dark-gray">Health Alerts</h3>
            </div>
            <div className="space-y-3">
              {unreadAlerts === 0 ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-success">✓ All Good</p>
                  <p className="text-xs text-gray-600">No urgent alerts</p>
                </div>
              ) : (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-danger">! Attention Needed</p>
                  <p className="text-xs text-gray-600">You have {unreadAlerts} unread urgent alerts.</p>
                </div>
              )}
              {reportsCount > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer" onClick={() => navigate('/patient/reports')}>
                  <p className="text-sm font-semibold text-primary">📋 My Reports</p>
                  <p className="text-xs text-gray-600">You have {reportsCount} medical report(s) uploaded.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* ── Appointment Detail Modal ── */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md p-4 sm:p-6 animate-fade-in overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-dark-gray">Appointment Details</h2>
              <button onClick={() => setSelectedAppointment(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                {(selectedAppointment.doctor?.name || selectedAppointment.doctorName || "D").charAt(0)}
              </div>
              <div>
                <p className="font-bold text-dark-gray">Dr. {selectedAppointment.doctor?.name || selectedAppointment.doctorName || "Unknown"}</p>
                <p className="text-sm text-gray-500">{selectedAppointment.doctor?.specialization || "Specialist"}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: "Date", value: new Date(selectedAppointment.date).toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short", year:"numeric" }) },
                { label: "Time", value: selectedAppointment.time },
                { label: "Mode", value: selectedAppointment.type },
                { label: "Status", value: selectedAppointment.status },
                { label: "Reason", value: selectedAppointment.reason },
              ].filter(r => r.value).map((row) => (
                <div key={row.label} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-semibold text-dark-gray capitalize">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {selectedAppointment.type?.toLowerCase() === "video" && (
                <button
                  onClick={() => joinVideoCall(selectedAppointment._id || selectedAppointment.id, currentUser?.name)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1F5F7A] text-white font-semibold rounded-xl transition-colors"
                >
                  <Video className="w-4 h-4" /> Join Video Call
                </button>
              )}
              <button
                onClick={() => { setSelectedAppointment(null); navigate("/patient/my-appointments"); }}
                className="w-full py-2.5 border-2 border-primary text-primary hover:bg-blue-50 font-semibold rounded-xl transition-colors text-sm"
              >
                Manage Appointment →
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── Health Score Modal ── */}
      {showHealthModal && healthScoreData && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4"
          onClick={() => setShowHealthModal(false)}
        >
          <div
            className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md p-4 sm:p-6 animate-fade-in overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-dark-gray flex flex-row items-center gap-2">
                <Activity className="w-6 h-6 text-primary" /> Health Status Breakdown
              </h2>
              <button onClick={() => setShowHealthModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 p-4 rounded-xl mb-4 bg-gray-50 border border-gray-200">
              <div className="text-center w-1/3">
                <p className="text-xs text-gray-500 uppercase font-semibold">Score</p>
                <p className="text-2xl font-black text-dark-gray">{healthScoreData.score}/100</p>
              </div>
              <div className="text-center w-1/3 border-l border-r border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                <p className={`text-lg font-bold mt-1 ${healthScoreColor.split(' ')[1]}`}>{healthScoreData.status}</p>
              </div>
              <div className="text-center w-1/3">
                <p className="text-xs text-gray-500 uppercase font-semibold">BMI</p>
                <p className="text-lg font-bold text-dark-gray mt-1">{healthScoreData.bmi || '--'}</p>
              </div>
            </div>

            <div className="space-y-3 mt-6 mb-8">
              <h3 className="text-sm font-bold text-primary uppercase border-b-2 border-primary/20 pb-1">Score Breakdown</h3>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">Base Score</span>
                <span className="font-semibold text-green-600">100</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">BMI Factor</span>
                <span className={`font-semibold ${healthScoreData.breakdown.bmiPenalty > 0 ? "text-red-500" : "text-gray-400"}`}>
                  {healthScoreData.breakdown.bmiPenalty > 0 ? `-${healthScoreData.breakdown.bmiPenalty}` : "0"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">Pre-existing Needs</span>
                <span className={`font-semibold ${healthScoreData.breakdown.diseasePenalty > 0 ? "text-red-500" : "text-gray-400"}`}>
                  {healthScoreData.breakdown.diseasePenalty > 0 ? `-${healthScoreData.breakdown.diseasePenalty}` : "0"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">Allergies Info</span>
                <span className={`font-semibold ${healthScoreData.breakdown.allergyPenalty > 0 ? "text-red-500" : "text-gray-400"}`}>
                  {healthScoreData.breakdown.allergyPenalty > 0 ? `-${healthScoreData.breakdown.allergyPenalty}` : "0"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">Family History</span>
                <span className={`font-semibold ${healthScoreData.breakdown.familyHistoryPenalty > 0 ? "text-red-500" : "text-gray-400"}`}>
                  {healthScoreData.breakdown.familyHistoryPenalty > 0 ? `-${healthScoreData.breakdown.familyHistoryPenalty}` : "0"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">Smoking Habit</span>
                <span className={`font-semibold ${healthScoreData.breakdown.smokingPenalty > 0 ? "text-red-500" : healthScoreData.breakdown.smokingPenalty < 0 ? "text-green-600" : "text-gray-400"}`}>
                  {healthScoreData.breakdown.smokingPenalty > 0 ? `-${healthScoreData.breakdown.smokingPenalty}` : healthScoreData.breakdown.smokingPenalty < 0 ? `+${Math.abs(healthScoreData.breakdown.smokingPenalty)}` : "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">Physical Activity</span>
                <span className={`font-semibold ${healthScoreData.breakdown.exercisePenalty > 0 ? "text-red-500" : healthScoreData.breakdown.exercisePenalty < 0 ? "text-green-600" : "text-gray-400"}`}>
                  {healthScoreData.breakdown.exercisePenalty > 0 ? `-${healthScoreData.breakdown.exercisePenalty}` : healthScoreData.breakdown.exercisePenalty < 0 ? `+${Math.abs(healthScoreData.breakdown.exercisePenalty)}` : "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-600">Age Factor</span>
                <span className={`font-semibold ${healthScoreData.breakdown.agePenalty > 0 ? "text-red-500" : healthScoreData.breakdown.agePenalty < 0 ? "text-green-600" : "text-gray-400"}`}>
                  {healthScoreData.breakdown.agePenalty > 0 ? `-${healthScoreData.breakdown.agePenalty}` : healthScoreData.breakdown.agePenalty < 0 ? `+${Math.abs(healthScoreData.breakdown.agePenalty)}` : "-"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowHealthModal(false)}
              className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 text-dark-gray font-semibold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;

