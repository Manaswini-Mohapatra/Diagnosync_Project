// SymptomChecker.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Send, AlertCircle, Loader, Clock, ChevronRight, MessageSquare, X, Activity, ArrowLeft
} from "lucide-react";
import Logo from "../components/Logo";
import api from "../utils/api";

function SymptomChecker({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // ── Active chat state ──────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [conversationPhase, setConversationPhase] = useState("initial");

  // ── History state ──────────────────────────────────────────────────────
  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // ── Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── On mount: load history then start fresh session ───────────────────
  useEffect(() => {
    loadHistory();
    initSession();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/ml/history/chat");
      setChatHistory(res.data.sessions || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const initSession = async () => {
    try {
      setLoading(true);
      const res = await api.post("/ml/session");
      if (res.data?.sessionId) {
        setSessionId(res.data.sessionId);
        setMessages(
          res.data.greeting
            ? [{ type: "bot", text: res.data.greeting }]
            : [{ type: "bot", text: "Hello! I'm your AI health assistant. What symptoms are you experiencing today?" }]
        );
        setShowResults(false);
        setAnalysisResults(null);
        setConversationPhase("initial");
      }
    } catch (err) {
      console.error("Failed to start session:", err);
      setMessages([
        { type: "bot", text: "I'm having trouble connecting to the intelligence server. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading || !sessionId) return;

    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ml/chat", { sessionId, message: text });
      const data = res.data;

      if (data.reply) {
        setMessages((prev) => [...prev, { type: "bot", text: data.reply }]);
      }

      setConversationPhase(data.phase || "gathering");

      if (data.phase === "results" && data.results) {
        setAnalysisResults(data.results);
        setShowResults(true);
        // Refresh history to include this new session
        loadHistory();
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "I encountered an error connecting to the intelligence server. Please try again." },
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
    initSession();
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getSessionPreview = (session) => {
    const userMsg = session.messages?.find((m) => m.role === "user");
    return userMsg?.text || "New conversation";
  };

  const getSessionCondition = (session) => {
    // Try to extract condition from last bot message if results
    const botMsgs = session.messages?.filter((m) => m.role === "bot") || [];
    return botMsgs.length > 0 ? `${session.messages?.length || 0} messages` : "In progress";
  };

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  showHistory ? "bg-primary text-white" : "text-gray-600 hover:text-primary hover:bg-blue-50"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
                {chatHistory.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${showHistory ? "bg-white text-primary" : "bg-primary text-white"}`}>
                    {chatHistory.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate("/patient/dashboard")}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 hidden sm:inline" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* ── History Sidebar ─────────────────────────────────────────── */}
        {showHistory && (
          <aside className="w-80 bg-white border-r border-border-gray flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-border-gray flex items-center justify-between">
              <h2 className="font-bold text-dark-gray flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Previous Chats
              </h2>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {historyLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm">No previous conversations yet.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-border-gray">
                {chatHistory.map((session) => (
                  <button
                    key={session._id}
                    onClick={() => setSelectedSession(session)}
                    className="w-full text-left p-4 hover:bg-blue-50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-dark-gray truncate">
                      {getSessionPreview(session)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{getSessionCondition(session)}</span>
                      <span className="text-xs text-gray-400">{formatDate(session.createdAt)}</span>
                    </div>
                    {session.phase === "results" && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                        Completed
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-border-gray">
              <button
                onClick={handleReset}
                className="btn-primary w-full text-sm"
              >
                + New Conversation
              </button>
            </div>
          </aside>
        )}

        {/* ── Main Chat Area ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pb-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    message.type === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white text-dark-gray border border-border-gray rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-dark-gray border border-border-gray rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                  <Loader className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-sm text-gray-500">Processing...</p>
                </div>
              </div>
            )}

            {/* Results card */}
            {showResults && analysisResults && (
              <div className="bg-white rounded-2xl p-6 border-l-4 border-warning shadow-sm mt-4">
                <div className="flex items-start gap-4 mb-6">
                  <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-dark-gray mb-1">Analysis Results</h3>
                    <p className="text-gray-600 text-sm">
                      Based on your symptoms, here are the possible conditions:
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {(analysisResults.conditions || []).map((condition, i) => (
                    <div key={i} className="p-3 bg-light-gray rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-dark-gray">{condition.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{condition.description}</p>
                        </div>
                        <span className="badge-primary ml-2">{condition.probability}</span>
                      </div>
                      <div className="w-full bg-border-gray rounded-full h-2 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: condition.probability }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">Severity: {condition.severity}</p>
                    </div>
                  ))}
                </div>

                {(analysisResults.recommendations || []).length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-dark-gray font-semibold mb-2">Recommendations:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {analysisResults.recommendations.map((rec, i) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResults.urgency === "High" && (
                  <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm text-red-800 font-semibold">
                      ⚠️ This requires immediate medical attention. Please contact a doctor or visit an emergency room.
                    </p>
                  </div>
                )}

                {analysisResults.disclaimer && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                    <p className="text-xs text-gray-600">
                      <strong>Disclaimer:</strong> {analysisResults.disclaimer}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 flex-col sm:flex-row">
                  <button
                    onClick={() => navigate("/patient/treatment-recommendations")}
                    className="btn-primary flex items-center justify-center gap-2 flex-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    View Treatment Options
                  </button>
                  <button
                    onClick={() => navigate("/patient/appointments")}
                    className="btn-secondary flex-1"
                  >
                    Book Appointment
                  </button>
                  <button onClick={handleReset} className="btn-secondary flex-1">
                    Start Over
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!showResults && (
            <div className="bg-white rounded-2xl p-4 border border-border-gray shadow-sm">
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
                  onKeyPress={(e) => e.key === "Enter" && !loading && handleSendMessage(input)}
                  placeholder={
                    !sessionId
                      ? "Connecting to AI..."
                      : conversationPhase === "initial"
                      ? "Type your symptoms..."
                      : "Enter your response..."
                  }
                  disabled={loading || !sessionId}
                  className="input-field flex-1 disabled:bg-gray-100"
                />
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={loading || !sessionId}
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

      {/* ── Session Replay Modal ─────────────────────────────────────────── */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-border-gray">
              <div>
                <h2 className="font-bold text-dark-gray">Past Conversation</h2>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(selectedSession.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Chat messages */}
              <div className="p-5 space-y-3">
                {(selectedSession.messages || []).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-light-gray text-dark-gray border border-border-gray rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Prediction analysis results (if session was completed) */}
              {selectedSession.prediction && (
                <div className="mx-5 mb-5 rounded-2xl border-l-4 border-warning bg-amber-50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-warning" />
                    <h3 className="font-bold text-dark-gray">Analysis Results</h3>
                    {selectedSession.prediction.urgency && (
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                        selectedSession.prediction.urgency === 'High'
                          ? 'bg-red-100 text-red-700'
                          : selectedSession.prediction.urgency === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedSession.prediction.urgency} Urgency
                      </span>
                    )}
                  </div>

                  {/* Predicted conditions */}
                  {(selectedSession.prediction.conditions || []).length > 0 && (
                    <div className="space-y-2 mb-4">
                      {selectedSession.prediction.conditions.map((cond, i) => (
                        <div key={i} className="p-3 bg-white rounded-xl border border-amber-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-dark-gray">{cond.name}</span>
                            <span className="text-xs font-bold text-primary ml-2">{cond.probability}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: cond.probability }}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                              cond.severity === 'High' ? 'bg-red-100 text-red-700' :
                              cond.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>{cond.severity}</span>
                            {cond.description && (
                              <p className="text-xs text-gray-500 truncate">{cond.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {(selectedSession.prediction.recommendations || []).length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-xs font-bold text-dark-gray mb-2">Recommendations</p>
                      <ul className="space-y-1">
                        {selectedSession.prediction.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-gray-600">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Urgency high warning */}
                  {selectedSession.prediction.urgency === 'High' && (
                    <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 font-semibold">
                        This analysis indicated a high urgency condition. Please consult a doctor immediately.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border-gray flex gap-3">
              {selectedSession.prediction && (
                <button
                  onClick={() => { setSelectedSession(null); navigate("/patient/treatment-recommendations"); }}
                  className="btn-secondary flex-1 text-sm"
                >
                  View Treatments
                </button>
              )}
              <button
                onClick={() => setSelectedSession(null)}
                className="btn-primary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SymptomChecker;