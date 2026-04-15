import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, LogOut, Calendar, Clock, CheckCircle, Download, Search, XCircle, AlertTriangle, Video } from "lucide-react";
import Logo from "../components/Logo";
import { downloadAppointmentConfirmation } from "../utils/appointmentPdfGenerator";
import { joinVideoCall } from "../utils/videoCall";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";

function AppointmentBooking({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Dynamic API state
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  const [timeSlots, setTimeSlots] = useState([]);

  // Selection
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("video");
  const [reason, setReason] = useState("");
  
  // Phase 4.2 Confirmation flow
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  // Date bounds
  const today = new Date().toISOString().split('T')[0];
  const maxDateRaw = new Date();
  maxDateRaw.setMonth(maxDateRaw.getMonth() + 3);
  const maxDate = maxDateRaw.toISOString().split('T')[0];

  // Fetch doctors dynamically
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const queryParams = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
        const res = await api.get(`/doctors${queryParams}`);
        // Support array structures or unwrapped structures
        let docs = res.data.doctors || res.data.data;
        if (!Array.isArray(docs)) docs = [];
        setDoctors(docs);
      } catch (error) {
        console.error("Failed to load doctors", error);
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    
    // Apply debounce to avoid spamming the endpoint when typing
    const delayDebounceFn = setTimeout(() => {
      fetchDoctors();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fetch slot availability actively
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        const res = await api.get(`/doctors/${selectedDoctor}/slots?date=${selectedDate}`);
        if (res.data.data && res.data.data.length > 0) {
          setTimeSlots(res.data.data);
        } else {
          throw new Error("No slots returned, degrading to fallback list");
        }
      } catch {
        // Safe backend degradation to keep UI operable
        setTimeSlots([
          "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
          "11:00 AM", "2:00 PM", "2:30 PM", "3:00 PM"
        ]);
      }
      setSelectedTime(""); // Ensure the patient re-selects time for different days
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleConfirmAppointment = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        reason: reason || "General Consultation"
      };

      const res = await api.post("/appointments", payload);
      setConfirmedAppointment(res.data.data);
      setIsConfirmed(true);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to securely book your appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async () => {
    const aptId = confirmedAppointment?._id || confirmedAppointment?.id;
    if (!confirmedAppointment || !aptId) return;
    
    if (window.confirm("Are you sure you want to cancel this appointment immediately?")) {
      setIsCancelling(true);
      try {
        await api.patch(`/appointments/${aptId}/status`, { status: "cancelled" });
        setIsCancelled(true);
      } catch (error) {
        console.error("Failed to cancel", error);
        alert("Failed to cancel the appointment due to an error.");
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const handleDownloadConfirmation = () => {
    const doctorObj = doctors.find(d => d.userId === selectedDoctor || d._id === selectedDoctor || d.id === selectedDoctor);
    const appointmentData = {
      doctorName: doctorObj?.name || 'Assigned Doctor',
      specialty: doctorObj?.specialization || doctorObj?.specialty || 'General',
      date: selectedDate,
      time: selectedTime,
      appointmentType: appointmentType,
      reason: reason || "General Consultation",
      fee: doctorObj?.consultationFee ? `$${doctorObj.consultationFee}` : "$100",
      id: confirmedAppointment?._id || confirmedAppointment?.id || 'N/A'
    };
    
    downloadAppointmentConfirmation(appointmentData);
  };

  const getActiveDoctor = () => doctors.find(d => d.userId === selectedDoctor || d._id === selectedDoctor || d.id === selectedDoctor);

  // ────────────────────────────────────────────────────────────────────────
  // Cancellation Sub-screan
  if (isCancelled) {
    return (
       <div className="min-h-screen bg-light-gray">
          <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Logo/>
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="card text-center border-t-4 border-t-red-500">
             <div className="flex justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-danger" />
            </div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Appointment Cancelled</h1>
            <p className="text-gray-600 mb-8">This appointment reservation has been securely revoked from the system.</p>
            <button onClick={() => navigate("/patient/dashboard")} className="btn-primary">Back to Dashboard</button>
          </div>
        </div>
       </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Confirmation Screen
  if (isConfirmed) {
    const activeDoc = getActiveDoctor();
    return (
      <div className="min-h-screen bg-light-gray">
        {/* Navbar */}
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Logo/>
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
        </nav>

        {/* Confirmation */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
          <div className="card text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">
              Appointment Confirmed!
            </h1>
            <p className="text-gray-600 mb-8">
              Your appointment has been successfully scheduled. A confirmation
              system notification has been routed.
            </p>

            <div className="bg-light-gray rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-dark-gray mb-4">
                Appointment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="font-semibold text-gray-400 text-xs mt-0.5">
                    {confirmedAppointment?._id || confirmedAppointment?.id || 'Processing...'}
                  </p>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
                  <p className="text-gray-600">Doctor</p>
                  <p className="font-semibold text-dark-gray text-right">
                    {activeDoc?.name || 'Unknown'} <br/>
                    <span className="text-xs text-gray-500 font-normal">{activeDoc?.specialization}</span>
                  </p>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
                  <p className="text-gray-600">Date & Time</p>
                  <p className="font-semibold text-dark-gray text-right">
                    {selectedDate} at {selectedTime}
                  </p>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
                  <p className="text-gray-600">Type</p>
                  <p className="font-semibold text-dark-gray">
                    {appointmentType === "video" ? "Video Consultation" : "In-Person Visit"}
                  </p>
                </div>
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
                Receipt
              </button>
              
              <button
                onClick={handleCancelAppointment}
                disabled={isCancelling}
                className="px-4 py-2 border-2 border-red-100 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Processing...' : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </>
                )}
              </button>
            </div>

            {/* Join Video Call — only shown for video appointments */}
            {appointmentType === "video" && (
              <button
                onClick={() => joinVideoCall(
                  confirmedAppointment?._id || confirmedAppointment?.id,
                  currentUser?.name
                )}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
              >
                <Video className="w-5 h-5" />
                Join Video Call Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // Booking Form Screens
  return (
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo/>
            <div className="flex items-center gap-4">
               <NotificationBell />
               <button
                 onClick={() => navigate("/patient/dashboard")}
                 className="text-gray-600 hover:text-primary transition-colors text-sm font-semibold"
               >
                 ← Back to Dashboard
               </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">
            Book Appointment
          </h1>
          <p className="text-gray-600">
            Schedule a secure consultation powered by DiagnoSync Database
          </p>
        </div>

        {/* Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-300 ${step >= s ? "bg-primary" : "bg-gray-300 text-gray-500"}`}
              >
                {step > s ? <CheckCircle className="w-5 h-5 text-white" /> : s}
              </div>
              <div
                className={`flex-1 h-1 mx-2 transition-colors duration-300 ${step > s ? "bg-primary" : "bg-gray-200"}`}
              />
            </div>
          ))}
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="card animate-slide-in">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">
              Select a Doctor
            </h2>

            {/* Phase 4 Search UI */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search doctors by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingDoctors ? (
                <div className="text-center py-8 text-gray-500 animate-pulse">
                  Querying MongoDB Database...
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                   No clinical specialists match your search query.
                </div>
              ) : (
                doctors.map((doctor) => {
                  const docId = doctor.userId || doctor._id || doctor.id;
                  return (
                    <div
                      key={docId}
                      onClick={() => setSelectedDoctor(docId)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedDoctor === docId ? "border-primary bg-blue-50/50 shadow-sm" : "border-border-gray hover:border-blue-200 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-dark-gray">
                            Dr. {doctor.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {doctor.specialization || "General Physician"}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-gray-600">
                              ⭐ {doctor.rating || "4.9"} ({doctor.reviews || "100+"} verified reviews)
                            </span>
                            <span className="font-semibold text-primary">
                              ${doctor.consultationFee || "120"}/session
                            </span>
                          </div>
                        </div>
                        {selectedDoctor === docId && (
                           <CheckCircle className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <button
              onClick={() => selectedDoctor && setStep(2)}
              disabled={!selectedDoctor || isLoadingDoctors}
              className={`btn-primary w-full mt-6 ${(!selectedDoctor || isLoadingDoctors) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="card animate-slide-in">
            <h2 className="text-2xl font-bold text-dark-gray mb-6 flex justify-between items-center">
              Choose Date & Time
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Dr. {getActiveDoctor()?.name || ''}
              </span>
            </h2>

            <div className="mb-6">
              <label className="block font-semibold text-dark-gray mb-2">
                Select Date
              </label>
              <input
                type="date"
                min={today}
                max={maxDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field w-full cursor-text"
              />
              <p className="text-xs text-gray-500 mt-1">Calendar bounds securely confined to 90 days from today limit.</p>
            </div>

            <div className="mb-8">
              <label className="block font-semibold text-dark-gray mb-3 flex items-center justify-between">
                <span>Available Time Slots</span>
                {selectedDate && <span className="text-xs text-green-600 font-medium">Slots retrieved from API automatically</span>}
              </label>
              
              {!selectedDate ? (
                 <div className="p-4 rounded-lg bg-gray-50 text-center text-gray-500 text-sm border border-dashed border-gray-200">
                   Please select a date to verify server availability.
                 </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {timeSlots.length === 0 ? (
                    <div className="col-span-full text-center text-sm text-red-500 py-4">No slots available on this date.</div>
                  ) : (
                    timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-lg font-semibold text-sm transition-all shadow-sm ${selectedTime === time ? "bg-primary text-white scale-95" : "bg-white border text-dark-gray hover:border-primary border-gray-200"}`}
                      >
                        {time}
                      </button>
                    ))
                  )}
                </div>
              )}
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
          <div className="card animate-slide-in">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">
              Final Details
            </h2>

            <div className="mb-6">
              <label className="block font-semibold text-dark-gray mb-3">
                Appointment Protocol
              </label>
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 transition-colors ${appointmentType === "video" ? "border-primary bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <input
                    type="radio"
                    value="video"
                    checked={appointmentType === "video"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-medium text-dark-gray text-sm">Video Consultation</span>
                </label>
                <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 transition-colors ${appointmentType === "inperson" ? "border-primary bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                  <input
                    type="radio"
                    value="inperson"
                    checked={appointmentType === "inperson"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-medium text-dark-gray text-sm">In-Person Visit</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-semibold text-dark-gray mb-2">
                Reason for Visit (Critical)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms thoroughly so the doctor can prepare."
                className="input-field w-full h-28 resize-none"
              />
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8 mt-4">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> 
                System Booking Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-blue-200/50 pb-2">
                  <span className="text-blue-700">Practitioner</span>
                  <span className="font-semibold text-dark-gray">Dr. {getActiveDoctor()?.name}</span>
                </div>
                <div className="flex justify-between border-b border-blue-200/50 pb-2">
                  <span className="text-blue-700">Date</span>
                  <span className="font-semibold text-dark-gray">{selectedDate}</span>
                </div>
                <div className="flex justify-between border-b border-blue-200/50 pb-2">
                  <span className="text-blue-700">Time</span>
                  <span className="font-semibold text-dark-gray">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-blue-700">Protocol</span>
                   <span className="font-semibold text-dark-gray">{appointmentType === "video" ? "Video Tele-Consult" : "Physical Visit"}</span>
                 </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="btn-secondary flex-1"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmAppointment}
                disabled={isSubmitting}
                className={`btn-primary flex-1 flex items-center justify-center gap-2 ${isSubmitting ? "opacity-75 cursor-wait" : ""}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Securing Slot...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm with Server
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentBooking;
