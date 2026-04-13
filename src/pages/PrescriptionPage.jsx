import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, LogOut, ArrowLeft, Download, Printer, Share2, Clock, CheckCircle, AlertCircle, Plus, X } from 'lucide-react'
import Footer from '../components/Footer'
import Logo from '../components/Logo'
import { downloadPrescriptionPDF } from '../utils/pdfGenerator'

function PrescriptionPage({ onLogout, currentUser }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('active')
  const [showAddModal, setShowAddModal] = useState(false)
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      medicationName: 'Aspirin',
      strength: '500mg',
      form: 'Tablet',
      frequency: 'Once daily',
      quantity: '30 tablets',
      refillsRemaining: 2,
      prescribedDate: '2024-01-15',
      expiryDate: '2024-04-15',
      doctor: 'Dr. Sarah Johnson',
      indication: 'Pain relief and cardiovascular health',
      instructions: 'Take with food to avoid stomach upset',
      status: 'active',
      pharmacy: 'Central Pharmacy',
      prescriptionNumber: 'RX-2024-001',
      notes: 'Do not exceed recommended dose'
    },
    {
      id: 2,
      medicationName: 'Lisinopril',
      strength: '10mg',
      form: 'Tablet',
      frequency: 'Twice daily',
      quantity: '60 tablets',
      refillsRemaining: 1,
      prescribedDate: '2024-02-01',
      expiryDate: '2024-05-01',
      doctor: 'Dr. Michael Chen',
      indication: 'Blood pressure control',
      instructions: 'Take at the same time each day',
      status: 'active',
      pharmacy: 'Central Pharmacy',
      prescriptionNumber: 'RX-2024-002',
      notes: 'Monitor blood pressure regularly'
    },
    {
      id: 3,
      medicationName: 'Atorvastatin',
      strength: '20mg',
      form: 'Tablet',
      frequency: 'Once daily at night',
      quantity: '30 tablets',
      refillsRemaining: 0,
      prescribedDate: '2023-12-10',
      expiryDate: '2024-03-10',
      doctor: 'Dr. Sarah Johnson',
      indication: 'Cholesterol management',
      instructions: 'Take at bedtime for better absorption',
      status: 'discontinued',
      pharmacy: 'Central Pharmacy',
      prescriptionNumber: 'RX-2023-045',
      notes: 'Requires regular cholesterol monitoring'
    },
    {
      id: 4,
      medicationName: 'Metformin',
      strength: '1000mg',
      form: 'Tablet',
      frequency: 'Three times daily',
      quantity: '90 tablets',
      refillsRemaining: 3,
      prescribedDate: '2024-01-20',
      expiryDate: '2024-04-20',
      doctor: 'Dr. Emily Davis',
      indication: 'Diabetes management',
      instructions: 'Take with meals to minimize GI upset',
      status: 'active',
      pharmacy: 'Central Pharmacy',
      prescriptionNumber: 'RX-2024-003',
      notes: 'Monitor blood sugar levels weekly'
    }
  ])

  const [newPrescription, setNewPrescription] = useState({
    medicationName: '',
    strength: '',
    form: 'Tablet',
    frequency: '',
    quantity: '',
    doctor: '',
    indication: '',
    instructions: '',
    notes: ''
  })

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  const activePrescriptions = prescriptions.filter(p => p.status === 'active')
  const discontinuedPrescriptions = prescriptions.filter(p => p.status === 'discontinued')

  const handleAddPrescription = () => {
    if (newPrescription.medicationName.trim() && newPrescription.strength.trim()) {
      const prescription = {
        id: prescriptions.length + 1,
        ...newPrescription,
        refillsRemaining: 3,
        prescribedDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        pharmacy: 'Central Pharmacy',
        prescriptionNumber: `RX-2024-${String(prescriptions.length + 1).padStart(3, '0')}`
      }
      setPrescriptions([...prescriptions, prescription])
      setNewPrescription({
        medicationName: '',
        strength: '',
        form: 'Tablet',
        frequency: '',
        quantity: '',
        doctor: '',
        indication: '',
        instructions: '',
        notes: ''
      })
      setShowAddModal(false)
    }
  }

  const handleDeletePrescription = (id) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id))
  }

  const handleRefill = (id) => {
    setPrescriptions(prescriptions.map(p =>
      p.id === id && p.refillsRemaining > 0
        ? { ...p, refillsRemaining: p.refillsRemaining - 1 }
        : p
    ))
  }

  const handlePrint = (prescription) => {
    const printWindow = window.open('', '', 'height=500,width=800')
    const htmlContent = `
      <html>
        <head>
          <title>Prescription - ${prescription.medicationName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .title { font-size: 24px; font-weight: bold; }
            .info-section { margin: 20px 0; }
            .info-label { font-weight: bold; color: #333; }
            .info-value { color: #666; margin-bottom: 10px; }
            .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; text-align: center; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">DiagnoSync - Prescription</div>
            </div>
            
            <div class="info-section">
              <div class="info-label">Medication:</div>
              <div class="info-value">${prescription.medicationName} ${prescription.strength}</div>
              
              <div class="info-label">Form:</div>
              <div class="info-value">${prescription.form}</div>
              
              <div class="info-label">Frequency:</div>
              <div class="info-value">${prescription.frequency}</div>
              
              <div class="info-label">Quantity:</div>
              <div class="info-value">${prescription.quantity}</div>
              
              <div class="info-label">Indication:</div>
              <div class="info-value">${prescription.indication}</div>
              
              <div class="info-label">Instructions:</div>
              <div class="info-value">${prescription.instructions}</div>
              
              <div class="info-label">Prescribed by:</div>
              <div class="info-value">${prescription.doctor}</div>
              
              <div class="info-label">Pharmacy:</div>
              <div class="info-value">${prescription.pharmacy}</div>
              
              <div class="info-label">Prescription Number:</div>
              <div class="info-value">${prescription.prescriptionNumber}</div>
              
              <div class="info-label">Date:</div>
              <div class="info-value">${prescription.prescribedDate}</div>
              
              <div class="info-label">Notes:</div>
              <div class="info-value">${prescription.notes}</div>
            </div>
            
            <div class="footer">
              <p>This prescription was printed from DiagnoSync Patient Portal</p>
              <p>For any queries, contact your healthcare provider</p>
            </div>
          </div>
        </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownloadPDF = (prescription) => {
    downloadPrescriptionPDF(prescription)
  }

  const handleShare = (prescription) => {
    const shareText = `Prescription Details:\n\nMedication: ${prescription.medicationName} ${prescription.strength}\nFrequency: ${prescription.frequency}\nDoctor: ${prescription.doctor}\nPrescription #: ${prescription.prescriptionNumber}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Prescription',
        text: shareText
      })
    } else {
      alert('Share this prescription:\n' + shareText)
    }
  }

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo/>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/patient/dashboard')}
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
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark-gray mb-2">My Prescriptions</h1>
            <p className="text-gray-600">Manage and view your medications</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Prescription
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border-gray">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'active'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            Active Prescriptions ({activePrescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('discontinued')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'discontinued'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            Discontinued ({discontinuedPrescriptions.length})
          </button>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-6">
          {activeTab === 'active' && activePrescriptions.length > 0 && (
            activePrescriptions.map((prescription) => (
              <div key={prescription.id} className="card">
                {/* Prescription Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-border-gray">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-dark-gray">
                        {prescription.medicationName}
                      </h3>
                      <span className="badge-primary">{prescription.strength}</span>
                      <span className="badge-success">Active</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Prescribed by: <span className="font-semibold">{prescription.doctor}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePrescription(prescription.id)}
                    className="text-danger hover:bg-red-100 p-2 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Prescription Details Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Form</p>
                      <p className="text-dark-gray">{prescription.form}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Frequency</p>
                      <p className="text-dark-gray">{prescription.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Quantity</p>
                      <p className="text-dark-gray">{prescription.quantity}</p>
                    </div>
                  </div>

                  {/* Middle Column */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Indication</p>
                      <p className="text-dark-gray">{prescription.indication}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Instructions</p>
                      <p className="text-dark-gray text-sm">{prescription.instructions}</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Prescribed Date</p>
                      <p className="text-dark-gray">{prescription.prescribedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Expiry Date</p>
                      <p className="text-dark-gray">{prescription.expiryDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Refills Remaining</p>
                      <p className="text-dark-gray font-semibold">
                        {prescription.refillsRemaining > 0 ? (
                          <span className="text-success">{prescription.refillsRemaining}</span>
                        ) : (
                          <span className="text-danger">No refills</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {prescription.notes && (
                  <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm">
                      <span className="font-semibold text-dark-gray">Note: </span>
                      <span className="text-gray-600">{prescription.notes}</span>
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {prescription.refillsRemaining > 0 ? (
                    <button
                      onClick={() => handleRefill(prescription.id)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Request Refill
                    </button>
                  ) : (
                    <button className="btn-secondary opacity-50 cursor-not-allowed flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No Refills Available
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadPDF(prescription)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => handlePrint(prescription)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={() => handleShare(prescription)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            ))
          )}

          {activeTab === 'discontinued' && discontinuedPrescriptions.length > 0 && (
            discontinuedPrescriptions.map((prescription) => (
              <div key={prescription.id} className="card opacity-75">
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-border-gray">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-600">
                        {prescription.medicationName}
                      </h3>
                      <span className="badge-primary">{prescription.strength}</span>
                      <span className="badge-danger">Discontinued</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Prescribed by: <span className="font-semibold">{prescription.doctor}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePrescription(prescription.id)}
                    className="text-danger hover:bg-red-100 p-2 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Form</p>
                    <p className="text-gray-600">{prescription.form}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Frequency</p>
                    <p className="text-gray-600">{prescription.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Discontinued Date</p>
                    <p className="text-gray-600">{prescription.expiryDate}</p>
                  </div>
                </div>

                <button
                  onClick={() => handlePrint(prescription)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            ))
          )}

          {(activeTab === 'active' && activePrescriptions.length === 0) && (
            <div className="card text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No active prescriptions</p>
              <p className="text-gray-500 text-sm mt-2">You can add prescriptions using the button above</p>
            </div>
          )}

          {(activeTab === 'discontinued' && discontinuedPrescriptions.length === 0) && (
            <div className="card text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No discontinued prescriptions</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Prescription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-dark-gray">Add Prescription</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-600 hover:text-primary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">Medication Name *</label>
                  <input
                    type="text"
                    value={newPrescription.medicationName}
                    onChange={(e) => setNewPrescription({ ...newPrescription, medicationName: e.target.value })}
                    className="input-field w-full"
                    placeholder="e.g., Aspirin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">Strength *</label>
                  <input
                    type="text"
                    value={newPrescription.strength}
                    onChange={(e) => setNewPrescription({ ...newPrescription, strength: e.target.value })}
                    className="input-field w-full"
                    placeholder="e.g., 500mg"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">Form</label>
                  <select
                    value={newPrescription.form}
                    onChange={(e) => setNewPrescription({ ...newPrescription, form: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Liquid">Liquid</option>
                    <option value="Injection">Injection</option>
                    <option value="Cream">Cream</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">Frequency</label>
                  <input
                    type="text"
                    value={newPrescription.frequency}
                    onChange={(e) => setNewPrescription({ ...newPrescription, frequency: e.target.value })}
                    className="input-field w-full"
                    placeholder="e.g., Twice daily"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">Quantity</label>
                  <input
                    type="text"
                    value={newPrescription.quantity}
                    onChange={(e) => setNewPrescription({ ...newPrescription, quantity: e.target.value })}
                    className="input-field w-full"
                    placeholder="e.g., 30 tablets"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-dark-gray mb-2">Doctor Name</label>
                  <input
                    type="text"
                    value={newPrescription.doctor}
                    onChange={(e) => setNewPrescription({ ...newPrescription, doctor: e.target.value })}
                    className="input-field w-full"
                    placeholder="e.g., Dr. John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">Indication</label>
                <input
                  type="text"
                  value={newPrescription.indication}
                  onChange={(e) => setNewPrescription({ ...newPrescription, indication: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., Pain relief"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">Instructions</label>
                <textarea
                  value={newPrescription.instructions}
                  onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                  className="input-field w-full h-20"
                  placeholder="e.g., Take with food"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-gray mb-2">Notes</label>
                <textarea
                  value={newPrescription.notes}
                  onChange={(e) => setNewPrescription({ ...newPrescription, notes: e.target.value })}
                  className="input-field w-full h-20"
                  placeholder="e.g., Do not exceed recommended dose"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-gray">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPrescription}
                  className="btn-primary flex-1"
                >
                  Add Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default PrescriptionPage
