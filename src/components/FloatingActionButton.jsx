import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Heart, Calendar, Activity, FileText, Pill, Users, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingActionButton({ role, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  // Auto-close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Do not render on auth pages, landing, or for admin users
  if (["/signin", "/signup", "/"].includes(location.pathname) || role === "admin" || location.pathname.startsWith("/admin")) {
    return null;
  }

  // Hide FAB for rejected doctors
  if (role === "doctor" && currentUser?.verificationStatus === "rejected") {
    return null;
  }

  const patientConfig = [
    { label: "Book Appointment", route: "/patient/appointments", icon: Calendar, color: "text-green-600", bg: "bg-green-100" },
    { label: "Symptom Checker", route: "/patient/symptom-checker", icon: Heart, color: "text-primary", bg: "bg-blue-100" },
    { label: "Treatment Plan", route: "/patient/treatment-recommendations", icon: Activity, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Prescriptions", route: "/patient/prescriptions", icon: Pill, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Health Reports", route: "/patient/reports", icon: FileText, color: "text-teal-600", bg: "bg-teal-100" },
  ];

  const doctorConfig = [
    { label: "Manage Schedule", route: "/doctor/dashboard?openSchedule=true", icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Appointments", route: "/doctor/appointments", icon: FileText, color: "text-green-600", bg: "bg-green-100" },
    { label: "Patients", route: "/doctor/patients", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Analytics", route: "/doctor/analytics", icon: BarChart2, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  // Default to patient logic if role is absent
  const config = role === "doctor" ? doctorConfig : patientConfig;

  return (
    <div className="fixed bottom-8 right-8 z-[100]" ref={menuRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-4 flex flex-col gap-3 items-end"
          >
            {config.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.route)}
                className="flex items-center gap-3 px-5 py-2.5 bg-white/90 backdrop-blur rounded-full shadow-glass hover:bg-gray-50 transition-colors whitespace-nowrap group"
              >
                <span className="text-sm font-bold text-dark-gray drop-shadow-sm">{item.label}</span>
                <div className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-4 h-4" />
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 bg-gradient-to-tr from-primary to-blue-500 text-white rounded-full shadow-glass flex items-center justify-center hover:scale-105 transition-all transform duration-300 ${isOpen ? "rotate-45" : ""}`}
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
