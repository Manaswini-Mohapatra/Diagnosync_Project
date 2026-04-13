import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, LogOut, Search, Filter } from "lucide-react";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

function PatientList({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const patients = [
    {
      id: 1,
      name: "John Doe",
      age: 45,
      gender: "M",
      lastVisit: "5 days ago",
      condition: "Hypertension",
      email: "john@example.com",
    },
    {
      id: 2,
      name: "Sarah Smith",
      age: 32,
      gender: "F",
      lastVisit: "2 days ago",
      condition: "Diabetes",
      email: "sarah@example.com",
    },
    {
      id: 3,
      name: "Mike Johnson",
      age: 56,
      gender: "M",
      lastVisit: "1 week ago",
      condition: "Heart Disease",
      email: "mike@example.com",
    },
    {
      id: 4,
      name: "Lisa Brown",
      age: 28,
      gender: "F",
      lastVisit: "Today",
      condition: "Asthma",
      email: "lisa@example.com",
    },
    {
      id: 5,
      name: "David Wilson",
      age: 52,
      gender: "M",
      lastVisit: "3 days ago",
      condition: "Arthritis",
      email: "david@example.com",
    },
  ];

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo/>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/doctor/dashboard")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                ← Back to Dashboard
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">
            My Patients
          </h1>
          <p className="text-gray-600">Manage and view your patients</p>
        </div>

        {/* Search and Filter */}
        <div className="card mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="space-y-4">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="card-hover p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-dark-gray">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-600">Age</p>
                        <p className="font-semibold text-dark-gray">
                          {patient.age} years
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Gender</p>
                        <p className="font-semibold text-dark-gray">
                          {patient.gender}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Condition</p>
                        <p className="font-semibold text-dark-gray">
                          {patient.condition}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Visit</p>
                        <p className="font-semibold text-dark-gray">
                          {patient.lastVisit}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button className="btn-primary text-sm px-4 py-2">
                      View Details
                    </button>
                    <button className="btn-secondary text-sm px-4 py-2">
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">No patients found</p>
              <p className="text-sm text-gray-500">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <button className="btn-secondary">← Previous</button>
          <span className="text-gray-600">Page 1 of 1</span>
          <button className="btn-secondary">Next →</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PatientList;
