import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Brain, Activity, Shield, ChevronRight, ChevronLeft, Menu, X } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (e, targetId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // Wait for the Framer Motion exit animation (300ms) to finish so the 
    // page layout is stable before we calculate the scroll position.
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 350);
  };

  const slides = [
    {
      image: "/images/hero/Image1.png",
      title: "AI-Powered Healthcare at Your Fingertips",
      description: "Get intelligent treatment recommendations powered by AI. Check drug interactions, schedule appointments, and manage your health in one place."
    },
    {
      image: "/images/hero/Image2.png",
      title: "Intelligent Symptom Analysis",
      description: "Our NLP chatbot analyzes your symptoms and provides preliminary diagnosis with AI precision."
    },
    {
      image: "/images/hero/Image3.png",
      title: "Personalized Treatment Plans",
      description: "Receive customized treatment plans based on your medical history and current condition."
    },
    {
      image: "/images/hero/Image4.png",
      title: "Secure & Private Medical Records",
      description: "Your health data is encrypted and securely stored. Access your medical history whenever you need it."
    },
    {
      image: "/images/hero/Image5.png",
      title: "Connect with Specialists",
      description: "Book appointments and consult directly with highly-rated verified medical professionals."
    }
  ];

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative w-full bg-white shadow-sm z-50">
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
              <a href="#features" className="text-gray-600 hover:text-primary font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary font-medium">How It Works</a>
              <a href="#" className="text-gray-600 hover:text-primary font-medium">About</a>
            </div>
            <div className="hidden md:flex gap-4">
              <Link to="/signin" className="btn-secondary">Sign In</Link>
              <Link to="/signup" className="btn-primary">Get Started</Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="text-gray-600 hover:text-primary p-2 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-soft absolute w-full left-0 z-40"
            >
              <div className="px-4 pt-4 pb-6 space-y-4">
                <a href="#features" onClick={(e) => handleMobileNavClick(e, 'features')} className="block text-gray-600 hover:text-primary py-2 font-medium">Features</a>
                <a href="#how-it-works" onClick={(e) => handleMobileNavClick(e, 'how-it-works')} className="block text-gray-600 hover:text-primary py-2 font-medium">How It Works</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); }} className="block text-gray-600 hover:text-primary py-2 font-medium">About</a>
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  <Link to="/signin" className="btn-secondary text-center w-full">Sign In</Link>
                  <Link to="/signup" className="btn-primary text-center w-full">Get Started</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section (Carousel) */}
      <section 
        className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            />
            {/* Dark Overlay Gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
            
            {/* Slide Content */}
            <div className="relative h-full flex flex-col items-center justify-center px-4 max-w-7xl mx-auto z-10">
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto drop-shadow-lg font-medium leading-relaxed">
                  {slides[currentSlide].description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/signup"
                    className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    Start Free <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/60 transition-colors backdrop-blur-md z-20 hidden md:flex cursor-pointer border border-white/10"
        >
          <ChevronLeft className="w-8 h-8 ml-[-2px]" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/60 transition-colors backdrop-blur-md z-20 hidden md:flex cursor-pointer border border-white/10"
        >
          <ChevronRight className="w-8 h-8 mr-[-2px]" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-500 rounded-full ${currentSlide === i ? "w-10 h-2.5 bg-primary shadow-glow" : "w-2.5 h-2.5 bg-white/50 hover:bg-white"}`}
            />
          ))}
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
