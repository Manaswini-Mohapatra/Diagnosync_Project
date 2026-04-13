import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import PasswordReset from "./pages/PasswordReset";
import PatientDashboard from "./pages/PatientDashboard";
import PatientProfilePage from "./pages/PatientProfilePage";
import SymptomChecker from "./pages/SymptomChecker";
import TreatmentRecommendations from "./pages/TreatmentRecommendations";
import AppointmentBooking from "./pages/AppointmentBooking";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import PatientList from "./pages/PatientList";
import DrugInteractionChecker from "./pages/DrugInteractionChecker";
import NotFound from "./pages/NotFound";
import PatientRegistrationForm from "./pages/PatientRegistrationForm";
import DoctorRegistrationForm from "./pages/DoctorRegistrationForm";
import PrescriptionPage from "./pages/PrescriptionPage";
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage";
import api from "./utils/api";

function App() {
  // ── Auth state — source of truth is the JWT token in localStorage ──
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token")  // true if token exists
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || "patient",
  );
  const [currentUser, setCurrentUser] = useState(
    () => {
      try {
        return JSON.parse(localStorage.getItem("currentUser")) || null;
      } catch { return null; }
    }
  );

  // ── Validate stored token on every app load/refresh ─────────────────────
  // If the token is expired or invalid, silently clears auth and redirects
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;  // not logged in, nothing to check

    api.get("/auth/me")
      .then((res) => {
        // Token is valid — refresh currentUser from DB in case profile changed
        setCurrentUser(res.data.user);
        setUserRole(res.data.user.role);
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
      })
      .catch(() => {
        // Token invalid or expired — api.js interceptor already clears localStorage
        setIsAuthenticated(false);
        setUserRole("patient");
        setCurrentUser(null);
      });
  }, []);

  const handleLogin = (role, userData) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentUser(userData);
    // Note: token + user already stored in localStorage by SignIn.jsx / SignUp.jsx
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("patient");
    setCurrentUser(null);
    // Clear all auth keys including the JWT token
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
  };

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!isAuthenticated) {
      return <Navigate to="/signin" replace />;
    }
    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to="/404" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
        <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
        <Route path="/password-reset" element={<PasswordReset />} />

        {/* Patient Routes */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientDashboard
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientProfilePage
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/symptom-checker"
          element={
            <ProtectedRoute requiredRole="patient">
              <SymptomChecker
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/treatment-recommendations"
          element={
            <ProtectedRoute requiredRole="patient">
              <TreatmentRecommendations
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute requiredRole="patient">
              <AppointmentBooking
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/registration"
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientRegistrationForm
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/prescriptions"
          element={
            <ProtectedRoute requiredRole="patient">
              <PrescriptionPage
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorDashboard
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorProfilePage
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute requiredRole="doctor">
              <PatientList onLogout={handleLogout} currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/drug-checker"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DrugInteractionChecker
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/registration"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorRegistrationForm
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorAppointmentsPage
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </ProtectedRoute>
          }
        />

        {/* Not Found */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
