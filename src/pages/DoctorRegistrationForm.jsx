import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, LogOut, ArrowLeft, CheckCircle } from 'lucide-react'

function DoctorRegistrationForm({ onLogout, currentUser }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    yearsOfExperience: '',
    licenseNumber: '',
    licenseState: '',
    hospitalAffiliation: '',
    consultationFee: '',
    specialties: [],
    qualifications: [],
    languages: []
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddSpecialty = (specialty) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }))
    }
  }

  const handleRemoveSpecialty = (index) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = () => {
    localStorage.setItem(`doctorRegistration_${currentUser?.id}`, JSON.stringify(formData))
    setIsSubmitted(true)
  }

  const specialtyOptions = [
    'Cardiologist',
    'Neurologist',
    'Dermatologist',
    'Orthopedist',
    'Pediatrician',
    'General Practitioner',
    'Psychiatrist',
    'Surgeon',
    'Ophthalmologist',
    'ENT Specialist'
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-light-gray">
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-primary">DiagnoSync</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="card text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Profile Created!</h1>
            <p className="text-gray-600 mb-8">
              Your professional information has been saved successfully.
            </p>
            <button
              onClick={() => navigate('/doctor/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-gray">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-primary">DiagnoSync</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/doctor/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-dark-gray mb-2">Doctor Profile Registration</h1>
        <p className="text-gray-600 mb-8">Complete your medical qualifications</p>

        {step === 1 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">Education & License</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="MD-123456"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">License State</label>
                  <input
                    type="text"
                    name="licenseState"
                    value={formData.licenseState}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">Hospital Affiliation</label>
                  <input
                    type="text"
                    name="hospitalAffiliation"
                    value={formData.hospitalAffiliation}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    placeholder="St. Luke's Hospital"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-gray">
                <button onClick={() => setStep(2)} className="btn-primary flex-1">Continue</button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">Specialties & Consultation</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-3">Select Specialties</label>
                <div className="grid md:grid-cols-2 gap-2 mb-4">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => {
                          if (formData.specialties.includes(specialty)) {
                            handleRemoveSpecialty(formData.specialties.indexOf(specialty))
                          } else {
                            handleAddSpecialty(specialty)
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.specialties.map((spec, i) => (
                    <span key={i} className="badge-primary">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">Consultation Fee ($)</label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="100"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-gray">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={handleSubmit} className="btn-primary flex-1">Complete Registration</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorRegistrationForm
