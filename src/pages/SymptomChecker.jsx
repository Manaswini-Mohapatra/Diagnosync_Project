// SymptomChecker.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, LogOut, Send, AlertCircle, Loader } from "lucide-react";
import Logo from "../components/Logo";

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
  const [symptomHistory, setSymptomHistory] = useState([]);
  const [conversationPhase, setConversationPhase] = useState("initial"); // initial, gathering, analyzing, results

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Call Chatbot API for intelligent responses
  const callChatbotAPI = async (userMessage, systemPrompt) => {
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      console.log("API Key loaded:", !!apiKey);
      
      if (!apiKey) {
        throw new Error("API Key not configured");
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: systemPrompt || "You are a helpful medical assistant",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "No response";
    } catch (error) {
      console.error("Fetch Error:", error);
      return "I'm having trouble connecting. Please try again.";
    }
  };
  // Get next follow-up question
  const getFollowUpQuestion = async (symptoms) => {
    const systemPrompt = `You are a medical assistant chatbot. Based on the symptoms provided, ask ONE specific follow-up question to better understand the patient's condition. 
    Keep your response to 1-2 sentences. Ask about:
    - Duration of symptoms
    - Severity (mild/moderate/severe)
    - Recent activities or exposures
    - Medications taken
    - Other relevant medical history
    
    Symptoms so far: ${symptoms.join(", ")}
    
    Previous questions asked: ${symptomHistory.join(", ")}
    
    Do NOT repeat previous questions. Make it conversational and medical.`;

    const userMessage = `Patient has reported: ${symptoms.join(", ")}. What should I ask next?`;
    return await callChatbotAPI(userMessage, systemPrompt);
  };

  // Analyze symptoms and generate results
  const analyzeSymptoms = async (symptoms, additionalInfo) => {
    const systemPrompt = `You are a medical diagnostic assistant. Based on the patient's symptoms and responses, provide a realistic medical analysis.
    
    Return your response in the following JSON format ONLY:
    {
      "primaryCondition": "Most likely condition",
      "risk": "Probability percentage",
      "conditions": [
        {
          "name": "Condition name",
          "probability": "XX%",
          "severity": "Low/Medium/High",
          "description": "Brief description"
        }
      ],
      "recommendations": [
        "Recommendation 1",
        "Recommendation 2",
        "Recommendation 3"
      ],
      "urgency": "Low/Medium/High",
      "disclaimer": "Important medical disclaimer"
    }
    
    Be realistic and evidence-based. Include common conditions that match the symptoms.`;

    const userMessage = `Patient symptoms: ${symptoms.join(", ")}. Additional information: ${additionalInfo}. Please analyze and provide possible diagnoses.`;

    try {
      const response = await callChatbotAPI(userMessage, systemPrompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.error("Analysis error:", error);
      return null;
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      if (conversationPhase === "initial") {
        // First message - user provides initial symptoms
        const symptoms = text.split(",").map((s) => s.trim());
        setSymptomHistory([]);
        setAnalysisResults(null);

        // Add to symptom history
        setSymptomHistory(symptoms);

        // Get follow-up question
        const followUp = await getFollowUpQuestion(symptoms);
        setMessages((prev) => [...prev, { type: "bot", text: followUp }]);
        setConversationPhase("gathering");
      } else if (conversationPhase === "gathering") {
        // Gathering additional information
        // Store the response
        const updatedHistory = [...symptomHistory, text];
        setSymptomHistory(updatedHistory);

        // Check if we have enough information (after 2-3 exchanges)
        if (updatedHistory.length >= 3) {
          // Move to analysis
          setMessages((prev) => [
            ...prev,
            { type: "bot", text: "Analyzing your symptoms..." },
          ]);
          setConversationPhase("analyzing");

          // Analyze symptoms
          const analysis = await analyzeSymptoms(symptomHistory, text);

          if (analysis) {
            setAnalysisResults(analysis);
            setShowResults(true);
            setConversationPhase("results");
          } else {
            // Get follow-up question first, then set message
            const followUp = await getFollowUpQuestion(symptomHistory);
            setMessages((prev) => [
              ...prev,
              {
                type: "bot",
                text: "I need to ask a few more questions. " + followUp,
              },
            ]);
          }
        } else {
          // Ask another follow-up question
          const followUp = await getFollowUpQuestion(updatedHistory);
          setMessages((prev) => [...prev, { type: "bot", text: followUp }]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "I encountered an error. Please try again.",
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
    setMessages([
      {
        type: "bot",
        text: "Hello! I'm your AI health assistant. What symptoms are you experiencing today?",
      },
    ]);
    setShowResults(false);
    setAnalysisResults(null);
    setSymptomHistory([]);
    setConversationPhase("initial");
    setInput("");
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
                  onClick={() => navigate("/patient/treatment-recommendations")}
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