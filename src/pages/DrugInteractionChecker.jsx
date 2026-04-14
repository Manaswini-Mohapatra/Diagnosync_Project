import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, LogOut, Plus, X, Search, Loader2 } from "lucide-react";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";

function DrugInteractionChecker({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [interactionsReport, setInteractionsReport] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogout = () => { onLogout(); navigate("/"); };

  // Fetch drug suggestions with debounce
  useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/medications?search=${encodeURIComponent(searchInput)}&limit=10`);
        if (res.data.success) {
          // Filter out already selected drugs
          const selectedNames = selectedDrugs.map(d => d.name);
          const filtered = res.data.data.filter(drug => !selectedNames.includes(drug.name));
          setSuggestions(filtered);
        }
      } catch (error) {
        console.error("Error fetching medications:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, selectedDrugs]);

  const addDrug = (drug) => {
    setSelectedDrugs([
      ...selectedDrugs,
      { 
        name: drug.name, 
        dose: drug.dosage || "Standard Dose", 
        frequency: drug.frequency || "Daily" 
      },
    ]);
    setSearchInput("");
    setInteractionsReport(null);
    setErrorMsg("");
  };

  const removeDrug = (index) => {
    setSelectedDrugs(selectedDrugs.filter((_, i) => i !== index));
    setInteractionsReport(null);
    setErrorMsg("");
  };

  const checkInteractions = async () => {
    if (selectedDrugs.length < 2) return;
    
    setIsChecking(true);
    setErrorMsg("");
    try {
      const payload = {
        drugs: selectedDrugs.map(d => d.name)
      };
      const res = await api.post("/interactions/check", payload);
      if (res.data.success) {
        setInteractionsReport(res.data.data);
      }
    } catch (error) {
      console.error("Error checking interactions:", error);
      setErrorMsg(error.response?.data?.error || "An error occurred while checking drug interactions.");
    } finally {
      setIsChecking(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "major":
        return "bg-red-50 border-l-4 border-danger text-danger";
      case "moderate":
        return "bg-yellow-50 border-l-4 border-warning text-warning";
      case "minor":
        return "bg-blue-50 border-l-4 border-primary text-primary";
      default:
        return "bg-light-gray";
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
      case "major":
        return "badge-danger";
      case "moderate":
        return "badge-warning";
      case "minor":
        return "badge-primary";
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/doctor/dashboard")} className="text-gray-600 hover:text-primary transition-colors">
                ← Back to Dashboard
              </button>
              <NotificationBell />
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <LogOut className="w-4 h-4" /><span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-gray mb-2">Drug Interaction Checker</h1>
          <p className="text-gray-600">Ensure patient safety by checking for potential interactions between medications.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Drug Selection */}
          <div className="md:col-span-2">
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-dark-gray mb-4">Add Medications</h2>

              {/* Search Box */}
              <div className="relative mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by drug name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="input-field w-full pl-10"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {searchInput.trim() && !isSearching && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border-gray rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((drug) => (
                      <button
                        key={drug._id}
                        onClick={() => addDrug(drug)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-border-gray last:border-b-0 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <span className="font-semibold text-dark-gray block">{drug.name}</span>
                          {drug.genericName && <span className="text-xs text-gray-500">{drug.genericName}</span>}
                        </div>
                        {drug.manufacturer && <span className="badge-secondary text-xs">{drug.manufacturer}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {searchInput.trim() && !isSearching && suggestions.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-border-gray rounded-lg shadow-lg px-4 py-3 text-gray-500 text-sm">
                    No medications found matching "{searchInput}".
                  </div>
                )}
              </div>

              {/* Selected Drugs */}
              <div className="mb-6">
                <h3 className="font-semibold text-dark-gray mb-3 flex items-center gap-2">
                  Selected Profile <span className="badge-primary">{selectedDrugs.length}</span>
                </h3>
                {selectedDrugs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDrugs.map((drug, i) => (
                      <div key={i} className="p-3 border border-gray-200 bg-gray-50 rounded-lg flex justify-between items-center transition-all hover:border-primary">
                        <div>
                          <p className="font-bold text-dark-gray">{drug.name}</p>
                          <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">{drug.dose} • {drug.frequency}</p>
                        </div>
                        <button onClick={() => removeDrug(i)} className="text-gray-400 hover:text-danger hover:bg-red-50 p-2 rounded-full transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    Add at least 2 medications to check for interactions.
                  </p>
                )}
              </div>

              {/* Check Button */}
              <button
                onClick={checkInteractions}
                disabled={selectedDrugs.length < 2 || isChecking}
                className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-60 h-[48px]"
              >
                {isChecking ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Protocols...</>
                ) : (
                  "Analyze Drug Interactions"
                )}
              </button>
              
              {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                  {errorMsg}
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="card h-fit">
            <h3 className="font-bold text-dark-gray mb-4">Guidelines</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                Search and select current medications.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                Add the proposed new prescription.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                Run clinical analysis engine.
              </li>
              <li className="flex items-start gap-2 text-warning font-semibold mt-4">
                Note: This tool is for advisory purposes. Always exercise clinical judgment.
              </li>
            </ul>
          </div>
        </div>

        {/* Results Pane */}
        {interactionsReport && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-dark-gray">Analysis Report</h2>
              <span className="text-sm text-gray-500 font-semibold bg-white px-3 py-1 border border-gray-200 rounded-full shadow-sm">
                Overall Profile: <span className={`ml-1 font-bold ${
                  interactionsReport.severity === 'major' ? 'text-danger' : 
                  interactionsReport.severity === 'moderate' ? 'text-warning' : 'text-success'
                }`}>{interactionsReport.severity.toUpperCase()}</span>
              </span>
            </div>

            {interactionsReport.interactions?.length > 0 ? (
              <div className="space-y-4">
                {interactionsReport.interactions.map((interaction, i) => (
                  <div key={i} className={`p-5 rounded-lg border shadow-sm ${getSeverityColor(interaction.severity)}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs uppercase font-bold tracking-wider opacity-70 mb-1 block">Identified Conflict</span>
                        <h3 className="font-bold text-lg">{interaction.drug1} ↔ {interaction.drug2}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getSeverityBadge(interaction.severity)}`}>
                        {interaction.severity} Risk
                      </span>
                    </div>
                    <p className="text-sm font-medium opacity-90">{interaction.description}</p>
                  </div>
                ))}
                
                {/* Recommendations Callout */}
                {interactionsReport.recommendations?.length > 0 && (
                  <div className="mt-6 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h4 className="font-bold text-dark-gray mb-3 flex items-center gap-2">Clinical Recommendations</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 w-full">
                      {interactionsReport.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Alternatives */}
                 {interactionsReport.alternatives?.length > 0 && (
                  <div className="mt-4 p-5 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                    <h4 className="font-bold text-primary mb-3">Suggested Alternatives</h4>
                    <ul className="space-y-2">
                       {interactionsReport.alternatives.map((alt, i) => (
                         <li key={i} className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-100 flex justify-between">
                            <span>Instead of <strong className="line-through opacity-70">{alt.drug}</strong></span>
                            <span className="text-primary font-bold">Consider: {alt.alternative}</span>
                         </li>
                       ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center py-12 border-2 border-dashed border-green-200 bg-green-50">
                <div className="w-16 h-16 bg-success text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                <h3 className="text-2xl font-bold text-success mb-2">No Known Interactions</h3>
                <p className="text-green-800 font-medium">The selected medication profile appears pharmacologically safe.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DrugInteractionChecker;
