import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Home } from 'lucide-react'

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-primary">MediCare+</span>
        </div>

        <h1 className="text-6xl font-bold text-dark-gray mb-4">404</h1>
        <p className="text-2xl font-bold text-dark-gray mb-2">Page Not Found</p>
        <p className="text-gray-600 mb-8">Sorry, the page you're looking for doesn't exist.</p>

        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
