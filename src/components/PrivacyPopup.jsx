// src/components/PrivacyPopup.jsx
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

export default function PrivacyPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Privacy Policy</h2>
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
            <h3 className="text-lg font-bold mb-3">1. Introduction</h3>
            <p>
              DiagnoSync ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, and interact with our platform.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">2. Information We Collect</h3>
            <p className="mb-3">We may collect information about you in a variety of ways:</p>
            
            <div className="space-y-3 ml-4">
              <div>
                <h4 className="font-semibold">Personal Data</h4>
                <p className="text-sm">Name, email address, phone number, date of birth, medical history, and other information you voluntarily provide.</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Medical Information</h4>
                <p className="text-sm">Symptoms, health conditions, medications, allergies, vital signs, and consultation records.</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Device Information</h4>
                <p className="text-sm">IP address, browser type, operating system, pages visited, and time spent on pages.</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Cookies and Tracking</h4>
                <p className="text-sm">We use cookies and similar tracking technologies to enhance your experience and analyze platform usage.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">3. Use of Your Information</h3>
            <p className="mb-3">We use the information we collect for various purposes, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Providing and maintaining our services</li>
              <li>Processing your requests and transactions</li>
              <li>Sending updates, alerts, and service announcements</li>
              <li>Improving our platform and user experience</li>
              <li>Complying with legal obligations</li>
              <li>Providing customer support</li>
              <li>Analyzing usage patterns and trends</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">4. Data Security</h3>
            <p>
              We implement administrative, technical, and physical security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is completely secure.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">5. Data Sharing</h3>
            <p className="mb-3">We do not sell, trade, or rent your personal information. We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Healthcare professionals (doctors, nurses) when you request their services</li>
              <li>Third-party service providers who assist in our operations</li>
              <li>Law enforcement if required by law</li>
              <li>Your emergency contacts in medical emergencies</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">6. Your Rights</h3>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to certain processing</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">7. Data Retention</h3>
            <p>
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. You may request deletion of your data at any time, subject to legal obligations.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">8. Children's Privacy</h3>
            <p>
              DiagnoSync is not intended for children under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child under 18, we will delete such information promptly.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">9. Third-Party Links</h3>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any personal information.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">10. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. Your continued use of our platform following the posting of revised Privacy Policy means you accept and agree to the changes.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">11. HIPAA Compliance</h3>
            <p>
              DiagnoSync is committed to protecting the privacy of health information in accordance with the Health Insurance Portability and Accountability Act (HIPAA) and other applicable healthcare privacy laws.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3">12. Contact Us</h3>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-light-gray p-4 rounded mt-3">
              <p><strong>Email:</strong> privacy@diagnosync.com</p>
              <p><strong>Address:</strong> Silicon University, Bhubaneswar</p>
              <p><strong>Phone:</strong> +1-800-DIAGNOSYNC</p>
            </div>
          </section>

          <p className="text-sm text-gray-500 mt-6">
            <strong>Last Updated:</strong> January 2026
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
          <Button onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={onClose}>
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
}
