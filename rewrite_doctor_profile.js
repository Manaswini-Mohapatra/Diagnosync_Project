const fs = require('fs');

const path = "c:/Users/manas/Downloads/healthcare-system-mvp/diagnosync-frontend/healthcare-system-mvp/src/pages/DoctorProfilePage.jsx";
let content = fs.readFileSync(path, 'utf8');

// 1. Add Imports
content = content.replace('import api from "../utils/api";', `import api from "../utils/api";
import RegistrationStepper from "../components/RegistrationStepper";
import {
  FormSection,
  FormTile,
  TextInput,
  TextArea,
  NumberInput,
  CheckboxGrid,
  SpecialtyTags,
  StepNav,
} from "../components/FormComponents";
import { AnimatePresence } from "framer-motion";`);

// 2. Add Stepper logic
content = content.replace('const [saving, setSaving] = useState(false);', `const [saving, setSaving] = useState(false);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward");
  
  const STEPS = [
    { id: 1, label: "Personal Information" },
    { id: 2, label: "Education & License" },
    { id: 3, label: "Specialties & Fees" },
    { id: 4, label: "Documents" },
  ];

  const goTo = (target) => {
    setDirection(target > step ? "forward" : "backward");
    setStep(target);
  };
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);`);

// 3. Update EMPTY_PROFILE in fetchProfile catch block
content = content.replace('setEditData({ ...EMPTY_PROFILE });', `setEditData({ ...EMPTY_PROFILE, fullName: currentUser?.name || "", phone: currentUser?.phone || "" });`);

// 4. Update handleEditClick
content = content.replace(/const handleEditClick = \(\) => {[\s\S]*?};/, `const handleEditClick = () => {
    setEditData({
      fullName: currentUser?.name || "",
      phone: currentUser?.phone || "",
      ...JSON.parse(JSON.stringify(profileData))
    });
    setStep(1);
    setIsEditing(true);
  };`);

// 5. Update handleSave
content = content.replace(/const payload = {[\s\S]*?};/, `const payload = {
        fullName: editData.fullName || undefined,
        phone: editData.phone || undefined,
        yearsOfExperience: editData.yearsOfExperience ? Number(editData.yearsOfExperience) : undefined,
        licenseNumber: editData.licenseNumber || undefined,
        licenseState: editData.licenseState || undefined,
        hospitalAffiliation: editData.hospitalAffiliation || undefined,
        consultationFee: editData.consultationFee ? Number(editData.consultationFee) : undefined,
        specialties: editData.specialties || [],
        bio: editData.bio || undefined,
        availableSlots: editData.availableSlots || undefined,
      };`);

// 6. Update the isEditing render block
const isEditingStart = content.indexOf('{isEditing ? (');
const isEditingEnd = content.indexOf(') : (', isEditingStart);

if (isEditingStart !== -1 && isEditingEnd !== -1) {
  const newIsEditing = `{isEditing ? (
          // ── EDIT MODE ──────────────────────────────────────────────────────
          <div className="bg-white/95 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid md:grid-cols-[280px_1fr]">
              {/* Sidebar */}
              <aside className="bg-white border-b md:border-b-0 md:border-r border-gray-100 p-6 md:p-8">
                <div className="mb-6 hidden md:block">
                  <h1 className="text-xl font-bold text-gray-900">Professional Profile</h1>
                  <p className="text-xs text-gray-400 mt-1">Complete your information step by step.</p>
                </div>
                <RegistrationStepper steps={STEPS} currentStep={step} onStepClick={(id) => id < step && goTo(id)} />
              </aside>

              {/* Content */}
              <main className="p-6 md:p-10 lg:p-12">
                <AnimatePresence mode="wait">

                  {/* ── Step 1: Personal Information ── */}
                  {step === 1 && (
                    <FormSection key="s1" direction={direction}>
                      <div className="space-y-2">
                        <FormTile label="Personal Information" hint="Update your personal details that will be displayed on your profile.">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <TextInput label="Full Name" value={editData.fullName} onChange={(e) => setEditData(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Dr. John Doe" />
                            <TextInput label="Phone Number" type="tel" value={editData.phone} onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+91 98765 43210" />
                          </div>
                        </FormTile>
                        <FormTile label="About" hint="Write a brief description about yourself and your practice.">
                          <TextArea label="About Me" value={editData.bio} onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))} placeholder="Experienced doctor specialising in..." rows={4} />
                        </FormTile>
                      </div>
                      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                        <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
                        <div className="flex-1"></div>
                        <StepNav isFirst onNext={next} />
                      </div>
                    </FormSection>
                  )}

                  {/* ── Step 2: Education & License ── */}
                  {step === 2 && (
                    <FormSection key="s2" direction={direction}>
                      <div className="space-y-2">
                        <FormTile label="Experience & Education" hint="Provide details about your professional qualifications.">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <NumberInput label="Years of Experience" value={editData.yearsOfExperience} onChange={(e) => setEditData(prev => ({ ...prev, yearsOfExperience: e.target.value }))} min={0} max={60} placeholder="e.g. 15" />
                          </div>
                        </FormTile>
                        <FormTile label="License Information" hint="Your medical license details for verification.">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <TextInput label="License Number" value={editData.licenseNumber} onChange={(e) => setEditData(prev => ({ ...prev, licenseNumber: e.target.value }))} placeholder="MD-123456" />
                            <TextInput label="License State / Region" value={editData.licenseState} onChange={(e) => setEditData(prev => ({ ...prev, licenseState: e.target.value }))} placeholder="Maharashtra" />
                          </div>
                        </FormTile>
                        <FormTile label="Hospital Affiliation" hint="The hospital or clinic you are currently affiliated with.">
                          <TextInput label="Hospital Name" value={editData.hospitalAffiliation} onChange={(e) => setEditData(prev => ({ ...prev, hospitalAffiliation: e.target.value }))} placeholder="Apollo Hospitals, Mumbai" />
                        </FormTile>
                      </div>
                      <StepNav onBack={back} onNext={next} />
                    </FormSection>
                  )}

                  {/* ── Step 3: Specialties & Fees ── */}
                  {step === 3 && (
                    <FormSection key="s3" direction={direction}>
                      <div className="space-y-2">
                        <FormTile label="Select Specialties" hint="Choose the medical specialties you practice. You can select multiple.">
                          <CheckboxGrid
                            options={SPECIALTY_OPTIONS.map(s => ({ value: s, label: s }))}
                            selected={editData.specialties || []}
                            onChange={(selected) => setEditData(prev => ({ ...prev, specialties: selected }))}
                            columns={2}
                          />
                          <SpecialtyTags
                            tags={editData.specialties || []}
                            onRemove={(label) => setEditData(prev => ({ ...prev, specialties: (prev.specialties || []).filter((s) => s !== label) }))}
                            className="mt-4"
                          />
                        </FormTile>
                        <FormTile label="Consultation Fee" hint="Set your standard fee per consultation session.">
                          <NumberInput label="Fee Amount" prefix="₹" value={editData.consultationFee} onChange={(e) => setEditData(prev => ({ ...prev, consultationFee: e.target.value }))} min={0} placeholder="e.g. 800" />
                        </FormTile>
                      </div>
                      <StepNav onBack={back} onNext={next} nextLabel="Continue to Documents" />
                    </FormSection>
                  )}

                  {/* ── Step 4: Documents ── */}
                  {step === 4 && (
                    <FormSection key="s4" direction={direction}>
                      <div className="space-y-2">
                        <FormTile label="Verification Documents" hint="Upload your medical license, certificates, and other verification documents.">
                          
                          {/* Upload Form */}
                          {!showUploadForm ? (
                            <button onClick={() => setShowUploadForm(true)} className="btn-secondary w-full py-4 border-dashed border-2 flex items-center justify-center gap-2 mb-4 hover:border-primary">
                              <Upload className="w-5 h-5" /> Click here to upload a new document
                            </button>
                          ) : (
                            <div className="mb-6 p-6 bg-blue-50 rounded-xl border border-primary/20">
                              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Document Type</label>
                                  <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full border-b-2 border-gray-200 focus:border-[#1F5F7A] outline-none py-2 text-sm bg-transparent">
                                    <option value="certificate">Medical Certificate</option>
                                    <option value="license">License</option>
                                    <option value="degree">Medical Degree</option>
                                    <option value="specialization">Specialization Certificate</option>
                                    <option value="other">Other Document</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1">Description (optional)</label>
                                  <input type="text" value={documentDescription} onChange={(e) => setDocumentDescription(e.target.value)} className="w-full border-b-2 border-gray-200 focus:border-[#1F5F7A] outline-none py-2 text-sm bg-transparent" placeholder="e.g. MBBS degree" />
                                </div>
                              </div>
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/40 bg-white rounded-xl cursor-pointer hover:border-primary transition-all duration-200">
                                <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" />
                                <Upload className="w-8 h-8 text-primary mb-2" />
                                <p className="text-sm font-semibold text-dark-gray">Select file</p>
                              </label>
                              <button onClick={() => setShowUploadForm(false)} className="mt-3 text-sm text-gray-500 w-full text-center hover:text-gray-700">Cancel upload</button>
                            </div>
                          )}

                          {/* Document List */}
                          {profileData?.documents?.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-xs font-bold text-gray-500">Uploaded Documents</p>
                              {profileData.documents.map((doc) => (
                                <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xl">{getFileIcon(doc.fileType)}</span>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-gray-800 truncate">{doc.fileName}</p>
                                      <p className="text-xs text-gray-400">{formatFileSize(doc.fileSize)} · {doc.documentType}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button onClick={() => handleDownloadDocument(doc)} className="p-2 rounded-lg hover:bg-white text-primary" title="Download"><Download className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteDocument(doc._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        </FormTile>
                      </div>
                      <StepNav onBack={back} isLast onSubmit={handleSave} isSubmitting={saving} submitLabel="Save Profile" />
                    </FormSection>
                  )}

                </AnimatePresence>
              </main>
            </div>
          </div>`;
  content = content.substring(0, isEditingStart) + newIsEditing + content.substring(isEditingEnd);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully rewrote DoctorProfilePage.jsx");
