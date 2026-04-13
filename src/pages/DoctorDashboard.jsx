import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  LogOut,
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";

function DoctorDashboard({ onLogout, currentUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const stats = [
    {
      label: "Patients Today",
      value: 8,
      icon: Users,
      color: "bg-blue-100",
      textColor: "text-primary",
    },
    {
      label: "Consultations",
      value: 45,
      icon: Calendar,
      color: "bg-green-100",
      textColor: "text-success",
    },
    {
      label: "Pending Cases",
      value: 3,
      icon: AlertCircle,
      color: "bg-warning bg-opacity-20",
      textColor: "text-warning",
    },
    {
      label: "Patient Rating",
      value: "4.8",
      icon: TrendingUp,
      color: "bg-purple-100",
      textColor: "text-purple-600",
    },
  ];

  const todayAppointments = [
    {
      id: 1,
      patient: "John Doe",
      time: "9:00 AM",
      type: "Video",
      status: "Completed",
    },
    {
      id: 2,
      patient: "Sarah Smith",
      time: "10:30 AM",
      type: "In-Person",
      status: "In Progress",
    },
    {
      id: 3,
      patient: "Mike Johnson",
      time: "11:30 AM",
      type: "Video",
      status: "Upcoming",
    },
    {
      id: 4,
      patient: "Lisa Brown",
      time: "2:00 PM",
      type: "In-Person",
      status: "Upcoming",
    },
  ];

  const urgentCases = [
    {
      id: 1,
      patient: "Alex Wilson",
      issue: "High fever (102°F)",
      urgency: "High",
      time: "15 minutes ago",
    },
    {
      id: 2,
      patient: "Emma Davis",
      issue: "Chest discomfort",
      urgency: "Critical",
      time: "5 minutes ago",
    },
  ];

  const actions = [
    { title: "My Patients", icon: Users, to: "/doctor/patients" },
    { title: "Drug Checker", icon: AlertCircle, to: "/doctor/drug-checker" },
    { title: "Appointments", icon: Calendar, to: "/doctor/appointments" },
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
        <h1 className="text-4xl font-bold text-dark-gray mb-8">
          Doctor Dashboard 
        </h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card">
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(action.to)}
                className="card-hover p-6 flex items-center gap-4"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-dark-gray text-lg">
                  {action.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Urgent Cases */}
        {urgentCases.length > 0 && (
          <div className="mb-8 card border-l-4 border-danger">
            <h2 className="text-xl font-bold text-dark-gray mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-danger" />
              Urgent Cases
            </h2>
            <div className="space-y-3">
              {urgentCases.map((case_) => (
                <div
                  key={case_.id}
                  className="p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-dark-gray">
                      {case_.patient}
                    </h3>
                    <span
                      className={`badge-${case_.urgency === "Critical" ? "danger" : "warning"}`}
                    >
                      {case_.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{case_.issue}</p>
                  <p className="text-xs text-gray-500">{case_.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Appointments */}
        <div className="card">
          <h2 className="text-xl font-bold text-dark-gray mb-4">
            Today's Appointments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-gray">
                  <th className="text-left py-3 px-4 font-semibold text-dark-gray">
                    Patient
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-gray">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-gray">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-gray">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-gray">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="border-b border-border-gray hover:bg-light-gray"
                  >
                    <td className="py-3 px-4">{apt.patient}</td>
                    <td className="py-3 px-4">{apt.time}</td>
                    <td className="py-3 px-4">{apt.type}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          apt.status === "Completed"
                            ? "badge-success"
                            : apt.status === "In Progress"
                              ? "badge-primary"
                              : "badge-primary"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:underline text-sm font-semibold">
                        {apt.status === "In Progress" ? "Continue" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default DoctorDashboard;
