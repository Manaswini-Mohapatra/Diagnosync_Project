// src/components/Footer.jsx
import React, { useState } from 'react';
import Logo from './Logo';
import TermsPopup from './TermsPopup';
import PrivacyPopup from './PrivacyPopup';

function Footer() {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="bg-dark-gray text-white py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Column 1: Logo & Description */}
            <div>
              <Logo />
              <p className="text-gray-400 mt-2">AI-powered healthcare diagnosis platform</p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h4 className="font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setIsTermsOpen(true)}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-none border-none p-0 text-left"
                  >
                    Terms
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsPrivacyOpen(true)}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-none border-none p-0 text-left"
                  >
                    Privacy
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="font-bold mb-4 text-white">Contact</h4>
              <p className="text-gray-400">support@diagnosync.com</p>
              <p className="text-gray-400">+1-800-DIAGNOSYNC</p>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">&copy; 2026 DiagnoSync. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Terms Popup */}
      <TermsPopup isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

      {/* Privacy Popup */}
      <PrivacyPopup isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
}

export default Footer;
