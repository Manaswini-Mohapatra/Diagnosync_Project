import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle, ArrowLeft, Loader, CreditCard, 
  Smartphone, Building2, Calendar, Clock, User
} from "lucide-react";
import api from "../utils/api";
import Logo from "../components/Logo";

function PaymentPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("upi");
  
  // Dummy fields for card
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aptRes = await api.get(`/appointments/${appointmentId}`);
        const aptData = aptRes.data.data;
        setAppointment(aptData);

        if (aptData.status !== "pending") {
          setError("This appointment has already been processed or cancelled.");
          setLoading(false);
          return;
        }

        const docRes = await api.get(`/doctors/${aptData.doctorId}`);
        setDoctor(docRes.data.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load payment details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appointmentId]);

  const handlePayNow = async () => {
    // Basic validation
    if (paymentMethod === "card" && (!cardName || !cardNumber || !cardExpiry || !cardCvv)) {
      setError("Please fill in all card details.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const payload = {
        appointmentId,
        paymentMethod,
        amount: doctor?.consultationFee || 500
      };

      const res = await api.post("/payments/create", payload);
      setSuccessData({
        transactionId: res.data.payment.transactionId,
        amount: res.data.payment.amount,
        method: paymentMethod
      });
      setStep(3); // Success Step
    } catch (err) {
      setError(err.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      {/* Navbar Minimal */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          {step < 3 && (
            <button onClick={() => navigate("/patient/dashboard")} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Cancel Payment
            </button>
          )}
        </div>
      </nav>

      <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1F5F7A] -z-10 rounded-full transition-all duration-300`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            
            <div className={`flex flex-col items-center gap-2 ${step >= 1 ? "text-[#1F5F7A]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? "bg-[#1F5F7A] text-white ring-4 ring-white" : "bg-gray-200 text-gray-500"}`}>1</div>
              <span className="text-xs font-semibold">Review</span>
            </div>
            <div className={`flex flex-col items-center gap-2 ${step >= 2 ? "text-[#1F5F7A]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? "bg-[#1F5F7A] text-white ring-4 ring-white" : "bg-gray-200 text-gray-500"}`}>2</div>
              <span className="text-xs font-semibold">Payment</span>
            </div>
            <div className={`flex flex-col items-center gap-2 ${step >= 3 ? "text-[#1F5F7A]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? "bg-[#1F5F7A] text-white ring-4 ring-white" : "bg-gray-200 text-gray-500"}`}>3</div>
              <span className="text-xs font-semibold">Confirm</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
          
          {error && step < 3 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── STEP 1: REVIEW DETAILS ── */}
          {step === 1 && appointment && doctor && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Appointment Summary</h2>
                <p className="text-sm text-gray-500 mt-1">Review the details before proceeding to payment.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Doctor</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> Dr. {doctor.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Specialty</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{doctor.specialization}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" /> {new Date(appointment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> {appointment.time} ({appointment.duration} min)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-t border-gray-100">
                <span className="text-gray-600 font-medium">Consultation Fee</span>
                <span className="text-2xl font-bold text-gray-900">₹{doctor.consultationFee || 500}</span>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setStep(2)} 
                  className="btn-primary px-8"
                  disabled={appointment.status !== "pending"}
                >
                  Proceed to Pay
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: PAYMENT DETAILS ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Select your preferred payment method.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Amount to Pay</p>
                  <p className="text-2xl font-bold text-[#1F5F7A]">₹{doctor?.consultationFee || 500}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <button onClick={() => setPaymentMethod("upi")} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === "upi" ? "border-[#1F5F7A] bg-[#1F5F7A]/5 text-[#1F5F7A]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  <Smartphone className="w-6 h-6" />
                  <span className="text-sm font-semibold">UPI</span>
                </button>
                <button onClick={() => setPaymentMethod("card")} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === "card" ? "border-[#1F5F7A] bg-[#1F5F7A]/5 text-[#1F5F7A]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm font-semibold">Card</span>
                </button>
                <button onClick={() => setPaymentMethod("netbanking")} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === "netbanking" ? "border-[#1F5F7A] bg-[#1F5F7A]/5 text-[#1F5F7A]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  <Building2 className="w-6 h-6" />
                  <span className="text-sm font-semibold">Net Banking</span>
                </button>
              </div>

              <div className="min-h-[200px] border border-gray-100 bg-gray-50 p-5 rounded-xl">
                {paymentMethod === "upi" && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700">Pay via UPI Apps (Google Pay, PhonePe, Paytm)</p>
                    <input type="text" placeholder="Enter UPI ID (e.g., name@okbank)" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A]" />
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Cardholder Name</label>
                      <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="John Doe" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A]" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Card Number</label>
                      <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Expiry</label>
                        <input type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A]" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">CVV</label>
                        <input type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="123" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A]" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700">Select your Bank</p>
                    <select className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1F5F7A]/20 focus:border-[#1F5F7A]">
                      <option value="">Select Bank...</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  Back
                </button>
                <button onClick={handlePayNow} disabled={processing} className="btn-primary px-8 flex items-center gap-2">
                  {processing ? <><Loader className="w-4 h-4 animate-spin" /> Processing...</> : `Pay ₹${doctor?.consultationFee || 500}`}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === 3 && successData && (
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Payment Successful!</h2>
                <p className="text-gray-500 mt-2">Your appointment is now confirmed.</p>
              </div>

              <div className="max-w-sm mx-auto bg-gray-50 rounded-xl p-6 border border-gray-100 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-semibold text-gray-900">{successData.transactionId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-semibold text-gray-900">₹{successData.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-semibold text-gray-900 capitalize">{successData.method}</span>
                </div>
              </div>

              <div className="pt-6">
                <button onClick={() => navigate("/patient/dashboard")} className="btn-primary w-full max-w-sm">
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
