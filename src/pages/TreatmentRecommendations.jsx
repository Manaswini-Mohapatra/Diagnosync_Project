import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  LogOut,
  Pill,
  Clock,
  TrendingUp,
  AlertCircle,
  X,
  Printer,
  ChevronRight,
  ArrowLeft,
  Share2,
} from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

function TreatmentRecommendations({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const treatments = [
    {
      id: 1,
      condition: "Common Cold",
      severity: "Low",
      recommendations: [
        { type: "Rest", description: "7-10 days of adequate rest" },
        { type: "Fluids", description: "Drink plenty of water and fluids" },
        { type: "Medication", description: "Over-the-counter pain relievers" },
      ],
      doctor: "Dr. Sarah Johnson",
      date: "March 15, 2024",
      duration: "7–10 days",
      followUp: "Return if symptoms worsen after 5 days",
      notes:
        "Stay well-rested, avoid contact with others to prevent spreading. Vitamin C supplements may help reduce duration.",
      warnings: [
        "Seek emergency care if you have difficulty breathing",
        "Watch for high fever above 103°F (39.4°C)",
      ],
    },
    {
      id: 2,
      condition: "Seasonal Allergies",
      severity: "Medium",
      recommendations: [
        { type: "Antihistamines", description: "Take daily antihistamines" },
        { type: "Avoidance", description: "Avoid allergen exposure" },
        { type: "Monitor", description: "Track symptoms and triggers" },
      ],
      doctor: "Dr. Michael Chen",
      date: "March 10, 2024",
      duration: "Ongoing (seasonal)",
      followUp: "Check-in at end of season",
      notes:
        "Keep windows closed during high pollen days. Use air purifiers indoors. Consider nasal corticosteroid spray for moderate symptoms.",
      warnings: [
        "Consult doctor if antihistamines cause excessive drowsiness",
        "Seek urgent care for severe allergic reaction (anaphylaxis)",
      ],
    },
  ];

  const severityConfig = {
    Low: { badge: "badge-success", print: "#22c55e" },
    Medium: { badge: "badge-warning", print: "#f59e0b" },
    High: { badge: "badge-danger", print: "#ef4444" },
  };

  const handlePrint = (treatment) => {
    const printWindow = window.open("", "", "height=700,width=900");
    printWindow.document.write(`
      <html>
        <head>
          <title>Treatment Plan — ${treatment.condition}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; color: #1a202c; }
            h1 { font-size: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
            h2 { font-size: 18px; margin-top: 20px; }
            .meta { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
            .severity { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: bold; background: #fef9c3; color: #92400e; }
            .rec-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
            .rec-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
            .rec-type { font-weight: bold; font-size: 14px; }
            .rec-desc { font-size: 13px; color: #6b7280; margin-top: 4px; }
            .warning { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px; margin: 6px 0; font-size: 13px; color: #991b1b; }
            .note { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; font-size: 13px; color: #1e40af; }
            .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <h1>DiagnoSync — Treatment Plan</h1>
          <p class="meta">
            Recommended by <strong>${treatment.doctor}</strong> &nbsp;|&nbsp;
            Date: <strong>${treatment.date}</strong> &nbsp;|&nbsp;
            Duration: <strong>${treatment.duration}</strong>
          </p>
          <h2>${treatment.condition} &nbsp;<span class="severity">${treatment.severity} Severity</span></h2>

          <h2>Recommended Treatment Plan</h2>
          <div class="rec-grid">
            ${treatment.recommendations
              .map(
                (r) => `<div class="rec-item">
              <div class="rec-type">${r.type}</div>
              <div class="rec-desc">${r.description}</div>
            </div>`
              )
              .join("")}
          </div>

          <h2>Clinical Notes</h2>
          <div class="note">${treatment.notes}</div>

          <h2>Warnings</h2>
          ${treatment.warnings.map((w) => `<div class="warning">⚠️ ${w}</div>`).join("")}

          <h2>Follow-Up</h2>
          <p>${treatment.followUp}</p>

          <div class="footer">
            Printed from DiagnoSync Patient Portal — For clinical queries, contact your healthcare provider.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const RecIcon = ({ type }) => {
    if (type === "Medication") return <Pill className="w-5 h-5 text-primary" />;
    if (type === "Rest") return <Clock className="w-5 h-5 text-primary" />;
    return <TrendingUp className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/patient/dashboard")}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">
            Treatment Recommendations
          </h1>
          <p className="text-gray-600">
            Your personalized treatment plans based on AI analysis
          </p>
        </div>

        {/* Treatments List */}
        <div className="space-y-6">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="card">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-border-gray">
                <div>
                  <h2 className="text-2xl font-bold text-dark-gray mb-2">
                    {treatment.condition}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Recommended by {treatment.doctor}</span>
                    <span>•</span>
                    <span>{treatment.date}</span>
                  </div>
                </div>
                <span className={severityConfig[treatment.severity]?.badge || "badge-primary"}>
                  {treatment.severity} Severity
                </span>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-dark-gray mb-4">
                  Recommended Treatment Plan
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {treatment.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-4 bg-light-gray rounded-lg border border-border-gray"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <RecIcon type={rec.type} />
                        <h4 className="font-semibold text-dark-gray">
                          {rec.type}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-dark-gray mb-1">
                    Important
                  </p>
                  <p className="text-sm text-gray-600">
                    Follow the treatment plan carefully. If symptoms persist or
                    worsen, contact your doctor immediately.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-border-gray">
                <button
                  onClick={() => setSelectedTreatment(treatment)}
                  className="btn-primary flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => handlePrint(treatment)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Plan
                </button>
                <button
                  className="btn-secondary flex items-center gap-2 opacity-50 cursor-not-allowed"
                  title="Messaging system coming soon"
                  disabled
                >
                  <Share2 className="w-4 h-4" />
                  Share with Doctor
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 p-6 bg-primary text-white rounded-lg text-center">
          <h3 className="text-xl font-bold mb-2">
            Need to Schedule a Consultation?
          </h3>
          <p className="mb-4">
            Book an appointment with your doctor for a proper diagnosis
          </p>
          <button
            onClick={() => navigate("/patient/appointments")}
            className="bg-white text-primary px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedTreatment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-border-gray">
              <div>
                <h2 className="text-2xl font-bold text-dark-gray">
                  {selectedTreatment.condition}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedTreatment.doctor} &nbsp;·&nbsp; {selectedTreatment.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedTreatment(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Severity + Duration */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[140px] p-4 bg-light-gray rounded-lg border border-border-gray">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Severity</p>
                  <span className={severityConfig[selectedTreatment.severity]?.badge || "badge-primary"}>
                    {selectedTreatment.severity}
                  </span>
                </div>
                <div className="flex-1 min-w-[140px] p-4 bg-light-gray rounded-lg border border-border-gray">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Duration</p>
                  <p className="font-semibold text-dark-gray">{selectedTreatment.duration}</p>
                </div>
                <div className="flex-1 min-w-[140px] p-4 bg-light-gray rounded-lg border border-border-gray">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Follow-Up</p>
                  <p className="text-sm text-dark-gray">{selectedTreatment.followUp}</p>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-bold text-dark-gray mb-3">Treatment Plan</h3>
                <div className="space-y-3">
                  {selectedTreatment.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <RecIcon type={rec.type} />
                      <div>
                        <p className="font-semibold text-dark-gray">{rec.type}</p>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-bold text-dark-gray mb-3">Clinical Notes</h3>
                <p className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  {selectedTreatment.notes}
                </p>
              </div>

              {/* Warnings */}
              <div>
                <h3 className="font-bold text-dark-gray mb-3">⚠️ Warnings</h3>
                <div className="space-y-2">
                  {selectedTreatment.warnings.map((w, i) => (
                    <div key={i} className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-border-gray">
              <button
                onClick={() => handlePrint(selectedTreatment)}
                className="btn-secondary flex items-center gap-2 flex-1"
              >
                <Printer className="w-4 h-4" />
                Print Plan
              </button>
              <button
                onClick={() => setSelectedTreatment(null)}
                className="btn-primary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default TreatmentRecommendations;
