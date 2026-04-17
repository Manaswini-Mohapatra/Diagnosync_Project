import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

const PrescriptionManagementModal = ({ isOpen, onClose, patientId, patientName, doctorId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list'); // 'list', 'add', 'edit'
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [formData, setFormData] = useState({
    medicationName: '',
    strength: '',
    form: 'Tablet',
    frequency: '',
    quantity: '',
    indication: '',
    instructions: '',
    notes: '',
    refillsRemaining: 0,
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPrescriptions();
      setMode('list');
    }
  }, [isOpen, patientId]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/prescriptions?patientId=${patientId}`);
      setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
      setError("Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      medicationName: '',
      strength: '',
      form: 'Tablet',
      frequency: '',
      quantity: '',
      indication: '',
      instructions: '',
      notes: '',
      refillsRemaining: 0,
      status: 'active'
    });
    setError('');
  };

  const handleAddClick = () => {
    resetForm();
    setMode('add');
  };

  const handleEditClick = (pres) => {
    setSelectedPrescription(pres);
    setFormData({
      medicationName: pres.medicationName || '',
      strength: pres.strength || '',
      form: pres.form || 'Tablet',
      frequency: pres.frequency || '',
      quantity: pres.quantity || '',
      indication: pres.indication || '',
      instructions: pres.instructions || '',
      notes: pres.notes || '',
      refillsRemaining: pres.refillsRemaining || 0,
      status: pres.status || 'active'
    });
    setMode('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (mode === 'add') {
        await api.post('/prescriptions', { ...formData, patientId });
      } else {
        await api.patch(`/prescriptions/${selectedPrescription.id || selectedPrescription._id}`, formData);
      }
      fetchPrescriptions();
      setMode('list');
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data?.error || "Failed to save prescription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions(prev => prev.filter(p => (p.id || p._id) !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Failed to delete prescription.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-dark-gray">
              {mode === 'list' ? `Prescriptions: ${patientName}` : mode === 'add' ? 'New Prescription' : 'Edit Prescription'}
            </h2>
            {mode === 'list' && <p className="text-xs text-gray-500 mt-0.5">Managing historical and active medications</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100 italic text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {mode === 'list' ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-600 uppercase text-xs tracking-wider">All History</h3>
                <button 
                  onClick={handleAddClick}
                  className="btn-primary py-1.5 px-3 text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12 flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-gray-500 text-sm">Fetching records...</p>
                </div>
              ) : prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {prescriptions.map((pres) => {
                    const isOwn = pres.doctorId === doctorId;
                    return (
                      <div key={pres.id || pres._id} className={`p-4 border rounded-xl transition-all ${isOwn ? 'border-primary/20 bg-blue-50/30' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-dark-gray text-lg">{pres.medicationName} <span className="text-base font-normal text-gray-400">({pres.strength})</span></h4>
                            <p className="text-xs text-gray-500 mt-1">Prescribed by Dr. {pres.doctorName} on {new Date(pres.prescribedDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${pres.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {pres.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500 font-medium block">Schedule:</span>
                            <span className="text-dark-gray">{pres.frequency} ({pres.form})</span>
                          </div>
                          <div>
                            <span className="text-gray-500 font-medium block">Quantity/Refills:</span>
                            <span className="text-dark-gray">{pres.quantity} / {pres.refillsRemaining} left</span>
                          </div>
                        </div>

                        {pres.instructions && (
                           <div className="text-xs bg-white/60 p-2 rounded border border-gray-100 text-gray-600 mb-4 italic">
                              "{pres.instructions}"
                           </div>
                        )}

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                          {isOwn ? (
                            <>
                              <button onClick={() => handleEditClick(pres)} className="text-primary hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button onClick={() => handleDelete(pres.id || pres._id)} className="text-danger hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-medium italic">Read-only (Another Provider)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
                   <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                   <p className="text-gray-500 font-medium">No prescriptions found for this patient.</p>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Medication Name</label>
                  <input
                    type="text"
                    name="medicationName"
                    value={formData.medicationName}
                    onChange={handleInputChange}
                    className="input-field w-full text-sm"
                    required
                    placeholder="e.g. Metformin"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Strength</label>
                  <input
                    type="text"
                    name="strength"
                    value={formData.strength}
                    onChange={handleInputChange}
                    className="input-field w-full text-sm"
                    required
                    placeholder="e.g. 500mg"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Form</label>
                  <select
                    name="form"
                    value={formData.form}
                    onChange={handleInputChange}
                    className="input-field w-full text-sm"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Liquid">Liquid</option>
                    <option value="Injection">Injection</option>
                    <option value="Cream">Cream</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Frequency</label>
                  <input
                    type="text"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className="input-field w-full text-sm"
                    placeholder="e.g. Twice daily"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="input-field w-full text-sm"
                    placeholder="e.g. 30 tablets"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Refills</label>
                  <input
                    type="number"
                    name="refillsRemaining"
                    value={formData.refillsRemaining}
                    onChange={handleInputChange}
                    className="input-field w-full text-sm"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Status</label>
                <div className="flex gap-4">
                  {['active', 'completed', 'discontinued'].map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value={status} 
                        checked={formData.status === status}
                        onChange={handleInputChange}
                        className="text-primary focus:ring-primary w-4 h-4"
                      />
                      <span className="text-sm text-gray-600 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Instructions (Patient Facing)</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  className="input-field w-full h-20 text-sm resize-none"
                  placeholder="e.g. Take after meals with plenty of water."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Internal Notes (Doctor Facing)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input-field w-full h-20 text-sm resize-none"
                  placeholder="e.g. Monitor liver enzymes every 3 months."
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="btn-secondary flex-1 py-3"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3 flex justify-center items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'add' ? 'Create Prescription' : 'Update Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionManagementModal;
