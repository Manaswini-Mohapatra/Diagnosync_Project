import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, LogOut, Pill, Clock, TrendingUp, AlertCircle } from 'lucide-react'
import Footer from '../components/Footer'

function TreatmentRecommendations({ onLogout, currentUser }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  const treatments = [
    {
      id: 1,
      condition: 'Common Cold',
      severity: 'Low',
      severityColor: 'bg-green-100',
      severityText: 'text-success',
      recommendations: [
        { type: 'Rest', description: '7-10 days of adequate rest' },
        { type: 'Fluids', description: 'Drink plenty of water and fluids' },
        { type: 'Medication', description: 'Over-the-counter pain relievers' }
      ],
      doctor: 'Dr. Sarah Johnson',
      date: 'March 15, 2024'
    },
    {
      id: 2,
      condition: 'Seasonal Allergies',
      severity: 'Medium',
      severityColor: 'bg-yellow-100',
      severityText: 'text-warning',
      recommendations: [
        { type: 'Antihistamines', description: 'Take daily antihistamines' },
        { type: 'Avoidance', description: 'Avoid allergen exposure' },
        { type: 'Monitor', description: 'Track symptoms and triggers' }
      ],
      doctor: 'Dr. Michael Chen',
      date: 'March 10, 2024'
    }
  ]

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              {/* <Heart className="w-6 h-6 text-primary" /> */}
               <img 
  src="/diagnosync_icon_transparent.svg" 
  alt="DiagnoSync Logo" 
  className="w-20 h-20"
/>
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">Treatment Recommendations</h1>
          <p className="text-gray-600">Your personalized treatment plans based on AI analysis</p>
        </div>

        {/* Treatments List */}
        <div className="space-y-6">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="card">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-border-gray">
                <div>
                  <h2 className="text-2xl font-bold text-dark-gray mb-2">{treatment.condition}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Recommended by {treatment.doctor}</span>
                    <span>•</span>
                    <span>{treatment.date}</span>
                  </div>
                </div>
                <span className={`badge-${treatment.severity === 'Low' ? 'success' : 'warning'}`}>
                  {treatment.severity} Severity
                </span>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-dark-gray mb-4">Recommended Treatment Plan</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {treatment.recommendations.map((rec, i) => (
                    <div key={i} className="p-4 bg-light-gray rounded-lg border border-border-gray">
                      <div className="flex items-center gap-2 mb-2">
                        {rec.type === 'Medication' && <Pill className="w-5 h-5 text-primary" />}
                        {rec.type === 'Rest' && <Clock className="w-5 h-5 text-primary" />}
                        {rec.type !== 'Medication' && rec.type !== 'Rest' && <TrendingUp className="w-5 h-5 text-primary" />}
                        <h4 className="font-semibold text-dark-gray">{rec.type}</h4>
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
                  <p className="text-sm font-semibold text-dark-gray mb-1">Important</p>
                  <p className="text-sm text-gray-600">
                    Follow the treatment plan carefully. If symptoms persist or worsen, contact your doctor immediately.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3 pt-4 border-t border-border-gray">
                <button className="btn-primary">View Details</button>
                <button className="btn-secondary">Print Plan</button>
                <button className="btn-secondary">Share with Doctor</button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 p-6 bg-primary text-white rounded-lg text-center">
          <h3 className="text-xl font-bold mb-2">Need to Schedule a Consultation?</h3>
          <p className="mb-4">Book an appointment with your doctor for a proper diagnosis</p>
          <button
            onClick={() => navigate('/patient/appointments')}
            className="bg-white text-primary px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Book Appointment
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default TreatmentRecommendations
