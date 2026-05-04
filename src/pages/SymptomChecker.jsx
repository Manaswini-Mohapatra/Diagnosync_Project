// SymptomChecker.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, LogOut, Send, AlertCircle, Loader } from "lucide-react";
import Logo from "../components/Logo";
import api from "../utils/api";

function SymptomChecker({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm your AI health assistant. What symptoms are you experiencing today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [conversationPhase, setConversationPhase] = useState("initial"); // initial, gathering, analyzing, results

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize ML Session on mount
  useEffect(() => {
    initSession();
  }, []);

  const initSession = async () => {
    try {
      setLoading(true);
      const res = await api.post("/ml/session");
      if (res.data && res.data.sessionId) {
        setSessionId(res.data.sessionId);
        setMessages([
          {
            type: "bot",
            text: res.data.greeting || "Hello! I'm your AI health assistant. What symptoms are you experiencing today?",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to start session:", err);
      setMessages([
        {
          type: "bot",
          text: "I'm having trouble connecting to the intelligence server. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading || !sessionId) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ml/chat", {
        sessionId,
        message: text
      });
      
      const data = res.data;
      
      if (data.reply) {
        setMessages((prev) => [...prev, { type: "bot", text: data.reply }]);
      }
      
      setConversationPhase(data.phase || "gathering");

      if (data.phase === "results" && data.results) {
        setAnalysisResults(data.results);
        setShowResults(true);
      }
      
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "I encountered an error connecting to the intelligence server. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleReset = () => {
    setShowResults(false);
    setAnalysisResults(null);
    setConversationPhase("initial");
    setInput("");
    initSession(); // Start a fresh session with backend
  };

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/patient/dashboard")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                ← Back to Dashboard
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

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-white text-dark-gray border border-border-gray rounded-bl-none"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-dark-gray border border-border-gray rounded-lg rounded-bl-none px-4 py-2 flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <p className="text-sm">Processing...</p>
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && analysisResults && (
            <div className="bg-white rounded-lg p-6 border-l-4 border-warning mt-4">
              <div className="flex items-start gap-4 mb-6">
                <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-dark-gray mb-1">
                    Analysis Results
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Based on your symptoms, here are the possible conditions:
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {analysisResults.conditions.map((condition, i) => (
                  <div key={i} className="p-3 bg-light-gray rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-dark-gray">
                          {condition.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {condition.description}
                        </p>
                      </div>
                      <span className="badge-primary ml-2">
                        {condition.probability}
                      </span>
                    </div>
                    <div className="w-full bg-border-gray rounded-full h-2 mb-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: condition.probability }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      Severity: {condition.severity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-dark-gray font-semibold mb-2">
                  Recommendations:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {analysisResults.recommendations.map((rec, i) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>

              {analysisResults.urgency === "High" && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800 font-semibold">
                    ⚠️ This requires immediate medical attention. Please contact a doctor or visit an emergency room.
                  </p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                <p className="text-xs text-gray-600">
                  <strong>Disclaimer:</strong> {analysisResults.disclaimer}
                </p>
              </div>

              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={() => navigate("/patient/treatment-recommendations", { state: { results: analysisResults } })}
                  className="btn-primary flex-1"
                >
                  View Treatment Options
                </button>
                <button
                  onClick={() => navigate("/patient/appointments")}
                  className="btn-secondary flex-1"
                >
                  Book Appointment
                </button>
                <button
                  onClick={handleReset}
                  className="btn-secondary flex-1"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!showResults && (
          <div className="bg-white rounded-lg p-4 border border-border-gray">
            {conversationPhase === "initial" && (
              <p className="text-xs text-gray-500 mb-2">
                Tip: List multiple symptoms separated by commas (e.g., "fever, cough, headache")
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !loading && handleSendMessage(input)
                }
                placeholder={
                  conversationPhase === "initial"
                    ? "Type your symptoms..."
                    : "Enter your response..."
                }
                disabled={loading}
                className="input-field flex-1 disabled:bg-gray-100"
              />
              <button
                onClick={() => handleSendMessage(input)}
                disabled={loading}
                className="btn-primary p-2 flex-shrink-0 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomChecker;