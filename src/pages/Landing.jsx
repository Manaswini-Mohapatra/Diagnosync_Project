import React from "react";
import { Link } from "react-router-dom";
import { Heart, Brain, Activity, Shield, ChevronRight } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo/>
            {/* <div className="flex items-center gap-2">
              <img
                src="/diagnosync_icon_transparent.svg"
                alt="DiagnoSync Logo"
                className="h-12 w-auto"
              />
              <span className="text-4xl font-bold leading-[1.3] pb-[2px] bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                DiagnoSync
              </span>
            </div> */}
            <div className="hidden md:flex gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary">
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-primary"
              >
                How It Works
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                About
              </a>
            </div>
            <div className="flex gap-4">
              <Link to="/signin" className="btn-secondary">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-dark-gray mb-6">
              AI-Powered Healthcare at Your Fingertips
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get intelligent treatment recommendations powered by AI. Check
              drug interactions, schedule appointments, and manage your health
              in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Start Free <ChevronRight className="w-4 h-4" />
              </Link>
              <button className="btn-secondary">Watch Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 bg-gradient-to-br from-blue-50 via-green-30 to-cyan-50"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-dark-gray mb-16">
            Key Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-hover">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-dark-gray mb-2">
                AI Symptom Checker
              </h3>
              <p className="text-gray-600">
                Our intelligent NLP chatbot analyzes your symptoms and provides
                preliminary diagnosis with AI precision.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-hover">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 mb-4">
                <Activity className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-bold text-dark-gray mb-2">
                Personalized Treatment
              </h3>
              <p className="text-gray-600">
                Receive customized treatment plans based on your medical history
                and current condition.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-hover">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-100 mb-4">
                <Shield className="w-6 h-6 text-danger" />
              </div>
              <h3 className="text-xl font-bold text-dark-gray mb-2">
                Drug Safety Check
              </h3>
              <p className="text-gray-600">
                Validate medications and prevent dangerous drug interactions
                automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 px-4 bg-gradient-to-r from-green-50 to-cyan-50"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-dark-gray mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              "Create Account",
              "Describe Symptoms",
              "Get Analysis",
              "View Treatment",
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-dark-gray text-lg">{step}</h3>
                <p className="text-gray-600 text-center text-sm mt-2">
                  {
                    [
                      "Sign up in minutes",
                      "Tell us about your health",
                      "AI analyzes your symptoms",
                      "Get personalized plan",
                    ][i]
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary via-green-500 to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Healthcare?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your health journey with AI-powered recommendations today.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-dark-gray text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-primary" />
                <span className="font-bold">DiagnoSync</span>
              </div>
              <p className="text-gray-400">AI-powered healthcare platform</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/" className="hover:text-white">Features</a></li>
                <li><a href="/" className="hover:text-white">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">Terms</a></li>
                <li><a href="/" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400">support@diagnosync.com</p>
              <p className="text-gray-400">+1-800-DIAGNOSYNC</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2026 DiagnoSync. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
      <Footer />
    </div>
  );
}

export default Landing;
