import React from "react";
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
} from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

function PatientDashboard({ onLogout, currentUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const stats = [
    {
      label: "Upcoming Appointments",
      value: 2,
      icon: Calendar,
      color: "bg-blue-100",
      textColor: "text-primary",
    },
    {
      label: "Active Prescriptions",
      value: 5,
      icon: Pill,
      color: "bg-green-100",
      textColor: "text-success",
    },
    {
      label: "Health Score",
      value: "85/100",
      icon: Activity,
      color: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      label: "Urgent Alerts",
      value: 0,
      icon: AlertCircle,
      color: "bg-red-100",
      textColor: "text-danger",
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
            {/* <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <img
                src="/diagnosync_icon_transparent.svg"
                alt="DiagnoSync Logo"
                className="w-20 h-20"
              />
              <span className="text-3xl font-bold text-primary">DiagnoSync</span>
            </div> */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {/* <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'P'}
                </div> */}
                <button
                  onClick={() => navigate("/patient/registration")}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold cursor-pointer hover:bg-blue-700"
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
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">
            Welcome back, {currentUser?.name?.split(" ")[0]}! 👋
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
                className="card animate-slide-in"
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
          <div className="lg:col-span-2 card">
            <h3 className="text-lg font-bold text-dark-gray mb-4">
              Upcoming Appointments
            </h3>
            <div className="space-y-4">
              <div className="p-4 border border-border-gray rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-dark-gray">
                      Dr. Sarah Johnson
                    </p>
                    <p className="text-sm text-gray-600">Cardiologist</p>
                  </div>
                  <span className="badge-primary">Tomorrow 10:30 AM</span>
                </div>
              </div>
              <div className="p-4 border border-border-gray rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-dark-gray">
                      Dr. Michael Chen
                    </p>
                    <p className="text-sm text-gray-600">General Physician</p>
                  </div>
                  <span className="badge-primary">Mar 20, 2:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Alerts */}
          <div className="card">
            <h3 className="text-lg font-bold text-dark-gray mb-4">
              Health Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-success">✓ All Good</p>
                <p className="text-xs text-gray-600">No urgent alerts</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-primary">
                  💊 Reminder
                </p>
                <p className="text-xs text-gray-600">Take medications today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PatientDashboard;
