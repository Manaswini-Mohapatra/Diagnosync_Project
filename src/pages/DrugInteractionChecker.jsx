import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, LogOut, Plus, X } from 'lucide-react'

function DrugInteractionChecker({ onLogout, currentUser }) {
  const navigate = useNavigate()
  const [selectedDrugs, setSelectedDrugs] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [showResults, setShowResults] = useState(false)

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  const mockDrugDatabase = [
    'Lisinopril', 'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Metformin',
    'Atorvastatin', 'Amoxicillin', 'Vitamin C', 'Vitamin D', 'Calcium'
  ]

  const filteredDrugs = mockDrugDatabase.filter(drug =>
    drug.toLowerCase().includes(searchInput.toLowerCase()) &&
    !selectedDrugs.find(d => d.name === drug)
  )

  const addDrug = (drugName) => {
    setSelectedDrugs([...selectedDrugs, { name: drugName, dose: '1000mg', frequency: 'Daily' }])
    setSearchInput('')
  }

  const removeDrug = (index) => {
    setSelectedDrugs(selectedDrugs.filter((_, i) => i !== index))
  }

  const checkInteractions = () => {
    if (selectedDrugs.length >= 2) {
      setShowResults(true)
    }
  }

  const interactions = [
    {
      drugs: ['Aspirin', 'Ibuprofen'],
      severity: 'critical',
      description: 'Combination increases risk of GI bleeding and stomach ulcers'
    },
    {
      drugs: ['Lisinopril', 'Ibuprofen'],
      severity: 'major',
      description: 'May reduce effectiveness of blood pressure control and affect kidney function'
    },
    {
      drugs: ['Metformin', 'Calcium'],
      severity: 'minor',
      description: 'Calcium may slightly reduce metformin absorption'
    }
  ]

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-l-4 border-danger text-danger'
      case 'major':
        return 'bg-yellow-100 border-l-4 border-warning text-warning'
      case 'minor':
        return 'bg-green-100 border-l-4 border-success text-success'
      default:
        return 'bg-light-gray'
    }
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return 'badge-danger'
      case 'major':
        return 'badge-warning'
      case 'minor':
        return 'badge-success'
      default:
        return 'badge-primary'
    }
  }

  return (
    <div className="min-h-screen bg-light-gray">
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
                onClick={() => navigate('/doctor/dashboard')}
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
          <h1 className="text-4xl font-bold text-dark-gray mb-2">Drug Interaction Checker</h1>
          <p className="text-gray-600">Check for interactions between medications</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Drug Selection */}
          <div className="md:col-span-2">
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-dark-gray mb-4">Search Drugs</h2>

              {/* Search Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search for drug name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {searchInput && filteredDrugs.length > 0 && (
                <div className="mb-4 border border-border-gray rounded-lg overflow-hidden">
                  {filteredDrugs.slice(0, 5).map((drug, i) => (
                    <button
                      key={i}
                      onClick={() => addDrug(drug)}
                      className="w-full text-left px-4 py-2 hover:bg-light-gray border-b border-border-gray last:border-b-0 transition-colors"
                    >
                      {drug}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Drugs */}
              <div className="mb-4">
                <h3 className="font-semibold text-dark-gray mb-3">Selected Drugs ({selectedDrugs.length})</h3>
                <div className="space-y-3">
                  {selectedDrugs.map((drug, i) => (
                    <div key={i} className="p-3 bg-light-gray rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-dark-gray">{drug.name}</p>
                        <p className="text-sm text-gray-600">{drug.dose} - {drug.frequency}</p>
                      </div>
                      <button
                        onClick={() => removeDrug(i)}
                        className="text-danger hover:bg-red-100 p-2 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Check Button */}
              <button
                onClick={checkInteractions}
                disabled={selectedDrugs.length < 2}
                className={`btn-primary w-full ${selectedDrugs.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Check Interactions
              </button>
            </div>
          </div>

          {/* Info Panel */}
          <div className="card">
            <h3 className="font-bold text-dark-gray mb-4">How to Use</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Search for a drug name</li>
              <li>2. Select from suggestions</li>
              <li>3. Add multiple drugs</li>
              <li>4. Click "Check Interactions"</li>
              <li>5. Review results</li>
            </ol>
          </div>
        </div>

        {/* Results */}
        {showResults && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-dark-gray mb-6">Interaction Results</h2>

            {interactions.length > 0 ? (
              <div className="space-y-4">
                {interactions.map((interaction, i) => (
                  <div key={i} className={`p-6 rounded-lg border ${getSeverityColor(interaction.severity)}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg">
                        {interaction.drugs.join(' + ')}
                      </h3>
                      <span className={getSeverityBadge(interaction.severity)}>
                        {interaction.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm">{interaction.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-success font-semibold mb-2">✓ No Interactions Found</p>
                <p className="text-gray-600">These drugs appear to be safe to use together</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DrugInteractionChecker
