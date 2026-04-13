import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, LogOut, Calendar, Clock, CheckCircle, Download } from "lucide-react";
import Logo from "../components/Logo";
import { downloadAppointmentConfirmation } from "../utils/appointmentPdfGenerator";

function AppointmentBooking({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("video");
  const [reason, setReason] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      rating: "4.8",
      reviews: "120",
      fee: "$100",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "General Physician",
      rating: "4.7",
      reviews: "98",
      fee: "$80",
    },
    {
      id: 3,
      name: "Dr. Emily Davis",
      specialty: "Neurologist",
      rating: "4.9",
      reviews: "150",
      fee: "$120",
    },
  ];

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleConfirmAppointment = () => {
    setIsConfirmed(true);
  };

  const handleDownloadConfirmation = () => {
    const selectedDoctorData = doctors.find((d) => d.id === selectedDoctor);
    const appointmentData = {
      doctorName: selectedDoctorData.name,
      specialty: selectedDoctorData.specialty,
      date: selectedDate,
      time: selectedTime,
      appointmentType: appointmentType,
      reason: reason || "General Consultation",
      fee: selectedDoctorData.fee,
    };
    
    downloadAppointmentConfirmation(appointmentData);
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-light-gray">
        {/* Navbar */}
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Logo/>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Confirmation */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="card text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">
              Appointment Confirmed!
            </h1>
            <p className="text-gray-600 mb-8">
              Your appointment has been successfully scheduled. A confirmation
              email has been sent to your registered email.
            </p>

            <div className="bg-light-gray rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-dark-gray mb-4">
                Appointment Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Doctor</p>
                  <p className="font-semibold text-dark-gray">
                    {doctors.find((d) => d.id === selectedDoctor)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Specialty</p>
                  <p className="font-semibold text-dark-gray">
                    {doctors.find((d) => d.id === selectedDoctor)?.specialty}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-dark-gray">
                    {selectedDate} at {selectedTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold text-dark-gray">
                    {appointmentType === "video"
                      ? "Video Consultation"
                      : "In-Person Visit"}
                  </p>
                </div>
                {reason && (
                  <div>
                    <p className="text-sm text-gray-600">Reason</p>
                    <p className="font-semibold text-dark-gray">{reason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/patient/dashboard")}
                className="btn-primary flex-1"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleDownloadConfirmation}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Confirmation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo/>
            <button
              onClick={() => navigate("/patient/dashboard")}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">
            Book Appointment
          </h1>
          <p className="text-gray-600">
            Schedule a consultation with our expert doctors
          </p>
        </div>

        {/* Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${step >= s ? "bg-primary" : "bg-light-gray text-gray-600"}`}
              >
                {s}
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${step > s ? "bg-primary" : "bg-light-gray"}`}
              />
            </div>
          ))}
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">
              Select a Doctor
            </h2>
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedDoctor === doctor.id ? "border-primary bg-blue-50" : "border-border-gray hover:border-primary"}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-dark-gray">
                        {doctor.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {doctor.specialty}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-600">
                          ⭐ {doctor.rating} ({doctor.reviews} reviews)
                        </span>
                        <span className="font-semibold text-primary">
                          {doctor.fee}/session
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => selectedDoctor && setStep(2)}
              disabled={!selectedDoctor}
              className={`btn-primary w-full mt-6 ${!selectedDoctor ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">
              Choose Date & Time
            </h2>

            <div className="mb-6">
              <label className="block font-semibold text-dark-gray mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field w-full"
              />
            </div>

            <div className="mb-6">
              <label className="block font-semibold text-dark-gray mb-3">
                Available Time Slots
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-lg font-semibold text-sm transition-all ${selectedTime === time ? "bg-primary text-white" : "bg-light-gray text-dark-gray hover:border-primary border-2 border-transparent"}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={() => selectedDate && selectedTime && setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className={`btn-primary flex-1 ${!selectedDate || !selectedTime ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Details */}
        {step === 3 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">
              Confirm Appointment
            </h2>

            <div className="mb-6">
              <label className="block font-semibold text-dark-gray mb-2">
                Appointment Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="video"
                    checked={appointmentType === "video"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Video Consultation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="inperson"
                    checked={appointmentType === "inperson"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>In-Person Visit</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-semibold text-dark-gray mb-2">
                Reason for Visit
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason for visit"
                className="input-field w-full h-24"
              />
            </div>

            {/* Summary */}
            <div className="bg-light-gray rounded-lg p-6 mb-6">
              <h3 className="font-bold text-dark-gray mb-4">Summary</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Doctor:</strong>{" "}
                  {doctors.find((d) => d.id === selectedDoctor)?.name}
                </p>
                <p>
                  <strong>Date:</strong> {selectedDate}
                </p>
                <p>
                  <strong>Time:</strong> {selectedTime}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  {appointmentType === "video"
                    ? "Video Consultation"
                    : "In-Person Visit"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={handleConfirmAppointment}
                className="btn-primary flex-1"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentBooking;
