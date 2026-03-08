import React from 'react'
import { Heart } from 'lucide-react'
import Logo from './Logo'

function Footer() {
  return (
    <footer className="bg-dark-gray text-white py-12 px-4 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8 ">
          <div>
<Logo size="small" />            {/* <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-primary" />
              <img 
  src="/diagnosync_icon_transparent.svg" 
  alt="DiagnoSync Logo" 
  className="w-20 h-20"
/>
              <span className="font-bold text-xl">DiagnoSync</span>
            </div> */}
            <p className="text-gray-400">AI-powered healthcare diagnosis platform</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white">Home</a></li>
              <li><a href="/" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="/" className="text-gray-400 hover:text-white">About Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-white">Terms</a></li>
              <li><a href="/" className="text-gray-400 hover:text-white">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Contact</h4>
            <p className="text-gray-400">support@diagnosync.com</p>
            <p className="text-gray-400">+1-800-DIAGNOSYNC</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400">&copy; 2026 DiagnoSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer