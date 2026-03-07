import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, LogOut, Send, AlertCircle } from 'lucide-react'

function SymptomChecker({ onLogout, currentUser }) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I\'m your AI health assistant. What symptoms are you experiencing today?' }
  ])
  const [input, setInput] = useState('')
  const [showResults, setShowResults] = useState(false)

  const symptoms = [
    'Fever',
    'Cough',
    'Headache',
    'Body ache',
    'Fatigue'
  ]

  const mockQuestions = [
    'How long have you had these symptoms?',
    'Do you have any other symptoms?',
    'Have you taken any medicine?'
  ]

  const [currentQuestion, setCurrentQuestion] = useState(0)

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  const handleSendMessage = (text) => {
    if (!text.trim()) return

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text }])
    setInput('')

    // Simulate bot response
    setTimeout(() => {
      if (currentQuestion < mockQuestions.length - 1) {
        setMessages(prev => [...prev, { type: 'bot', text: mockQuestions[currentQuestion + 1] }])
        setCurrentQuestion(prev => prev + 1)
      } else {
        // Show results
        setShowResults(true)
      }
    }, 500)
  }

  const results = {
    primaryCondition: 'Common Cold',
    risk: '78%',
    conditions: [
      { name: 'Common Cold', probability: '78%', severity: 'Low' },
      { name: 'Flu', probability: '15%', severity: 'Medium' },
      { name: 'Allergy', probability: '7%', severity: 'Low' }
    ]
  }

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-primary">DiagnoSync</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/patient/dashboard')}
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
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-white text-dark-gray border border-border-gray rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}

          {/* Quick Symptom Buttons */}
          {!showResults && currentQuestion === 0 && messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(symptom)}
                  className="px-3 py-1 bg-primary text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
                >
                  {symptom}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="bg-white rounded-lg p-6 border-l-4 border-warning">
              <div className="flex items-start gap-4 mb-6">
                <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-dark-gray mb-1">Analysis Results</h3>
                  <p className="text-gray-600 text-sm">Based on your symptoms, here are the possible conditions:</p>
                </div>
              </div>

              <div className="space-y-3">
                {results.conditions.map((condition, i) => (
                  <div key={i} className="p-3 bg-light-gray rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-dark-gray">{condition.name}</h4>
                      <span className="badge-primary">{condition.probability}</span>
                    </div>
                    <div className="w-full bg-border-gray rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: condition.probability }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Severity: {condition.severity}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-dark-gray font-semibold mb-2">Recommendations:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Rest and stay hydrated</li>
                  <li>• Monitor your symptoms</li>
                  <li>• Book an appointment with a doctor for proper diagnosis</li>
                </ul>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate('/patient/treatment-recommendations')}
                  className="btn-primary flex-1"
                >
                  View Treatment
                </button>
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="btn-secondary flex-1"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {!showResults && (
          <div className="bg-white rounded-lg p-4 border border-border-gray">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
                placeholder="Type your symptoms or press Enter..."
                className="input-field flex-1"
              />
              <button
                onClick={() => handleSendMessage(input)}
                className="btn-primary p-2 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SymptomChecker
