// src/components/TermsPopup.jsx
import React from 'react';
import { X } from 'lucide-react';

// Simple Button component - inline to avoid import issues
function Button({ children, onClick, variant = 'primary' }) {
  const baseStyles = 'px-6 py-2 rounded-lg font-semibold transition-colors border-none cursor-pointer';
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white'
  };
  
  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
}

export default function TermsPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="hover:bg-light-gray p-2 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-gray-700 space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-3">1. Acceptance of Terms</h3>
            <p>
              By accessing and using the DiagnoSync platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">2. Use License</h3>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on DiagnoSync's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on DiagnoSync's website</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">3. Disclaimer</h3>
            <p>
              The materials on DiagnoSync's website are provided on an 'as is' basis. DiagnoSync makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">4. Limitations</h3>
            <p>
              In no event shall DiagnoSync or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DiagnoSync's website, even if DiagnoSync or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">5. Accuracy of Materials</h3>
            <p>
              The materials appearing on DiagnoSync's website could include technical, typographical, or photographic errors. DiagnoSync does not warrant that any of the materials on its website are accurate, complete, or current. DiagnoSync may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">6. Links</h3>
            <p>
              DiagnoSync has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by DiagnoSync of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">7. Modifications</h3>
            <p>
              DiagnoSync may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">8. Governing Law</h3>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of [Your Country/State] and you irrevocably submit to the exclusive jurisdiction of the courts located in that location.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">9. Medical Disclaimer</h3>
            <p>
              DiagnoSync is an AI-powered platform designed to provide general health information and should not be construed as medical advice. Always consult with a qualified healthcare professional for diagnosis, treatment, and medical advice. DiagnoSync does not replace professional medical evaluation or treatment.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">10. User Responsibilities</h3>
            <p>
              Users are responsible for maintaining the confidentiality of their account information and passwords. Users agree to notify DiagnoSync of any unauthorized use of their accounts and to accept all risks of unauthorized access to the information provided.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={onClose}>
            I Agree
          </Button>
        </div>
      </div>
    </div>
  );
}
