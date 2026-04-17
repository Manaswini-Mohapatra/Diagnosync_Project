import React, { useState, useEffect } from "react";
import { X, Save, Clock, ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from "lucide-react";
import api from "../utils/api";

const DAYS = [
  "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday", "sunday"
];

const ALL_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM"
];

export default function DoctorScheduleModal({ onClose }) {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [view, setView] = useState("monthly"); // 'monthly' | 'weekly'
  const [activeDay, setActiveDay] = useState("monday"); // for weekly view
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // for monthly view
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await api.get("/doctors/me");
        if (res.data.success) {
          setSchedule(res.data.data.availableSlots || {});
        }
      } catch (err) {
        console.error("Failed to load schedule:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, []);

  const toggleSlot = (key, slot) => {
    setSchedule(prev => {
      const daySlots = prev[key] || [];
      if (daySlots.includes(slot)) {
        return { ...prev, [key]: daySlots.filter(s => s !== slot) };
      } else {
        const newSlots = [...daySlots, slot].sort((a, b) => ALL_SLOTS.indexOf(a) - ALL_SLOTS.indexOf(b));
        return { ...prev, [key]: newSlots };
      }
    });
  };

  const handleClearOverride = (date) => {
    if (window.confirm(`Clear specific slots for ${date} and return to weekly defaults?`)) {
      setSchedule(prev => {
        const newSched = { ...prev };
        delete newSched[date];
        return newSched;
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/doctors/me", { availableSlots: schedule });
      alert("Schedule updated successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to save schedule:", err);
      alert("Failed to save schedule: " + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  // ── Calendar Helpers ───────────────────────────────────────────────────────
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0-6

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = (getFirstDayOfMonth(year, month) + 6) % 7; // Align to Monday start

    const weeks = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const days = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDay) || day > daysInMonth) {
          days.push(<div key={`empty-${i}-${j}`} className="h-14 border border-gray-50 bg-gray-50/30" />);
        } else {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          const hasOverride = !!schedule[dateStr];
          const isToday = new Date().toISOString().split("T")[0] === dateStr;

          days.push(
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`h-14 border border-gray-100 flex flex-col items-center justify-center relative transition-all hover:bg-primary/5 ${
                isSelected ? "ring-2 ring-primary ring-inset bg-blue-50/50" : "bg-white"
              }`}
            >
              <span className={`text-sm font-semibold ${isToday ? "text-primary" : "text-dark-gray"}`}>
                {day}
              </span>
              {hasOverride && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" title="Date Override Active" />
              )}
            </button>
          );
          day++;
        }
      }
      weeks.push(<div key={`week-${i}`} className="grid grid-cols-7">{days}</div>);
      if (day > daysInMonth) break;
    }

    return weeks;
  };

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + offset)));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-12 text-center animate-pulse">
           <Clock className="w-12 h-12 text-primary mx-auto mb-4 animate-spin-slow" />
           <p className="text-gray-500 font-medium tracking-wide">Syncing Clinical Schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <CalendarIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark-gray">Practice Availability</h2>
              <div className="flex gap-4 mt-1">
                <button 
                  onClick={() => setView("monthly")} 
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${view === "monthly" ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
                >
                  Monthly Calendar
                </button>
                <button 
                  onClick={() => setView("weekly")} 
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${view === "weekly" ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
                >
                  Weekly Defaults
                </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar / Left View */}
          <div className="w-1/2 border-r border-gray-100 bg-gray-50/30 p-6 flex flex-col overflow-y-auto">
            {view === "weekly" ? (
              <>
                <div className="mb-6">
                  <h3 className="font-bold text-dark-gray mb-1">Weekly Defaults</h3>
                  <p className="text-xs text-gray-500">Repeating schedule for each day of the week.</p>
                </div>
                <div className="space-y-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`w-full text-left px-5 py-3 rounded-xl capitalize font-semibold transition-all ${
                        activeDay === day ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" : "bg-white border border-gray-100 text-gray-600 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        {day}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeDay === day ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                          {schedule[day]?.length || 0} slots
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-200 rounded-lg text-gray-500"><ChevronLeft className="w-5 h-5" /></button>
                    <h3 className="font-bold text-dark-gray text-lg min-w-[140px] text-center capitalize">
                      {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-200 rounded-lg text-gray-500"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                  ))}
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  {renderCalendar()}
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                   <p className="text-xs text-gray-600 leading-relaxed italic">
                    <span className="font-bold text-primary">Pro-tip:</span> Select a date to override your weekly defaults. 
                    <span className="inline-block w-2 h-2 rounded-full bg-primary mx-1" /> indicates a specific date schedule is active.
                   </p>
                </div>
              </>
            )}
          </div>

          {/* Main Context: Slot Picker */}
          <div className="w-1/2 p-8 overflow-y-auto bg-white flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
               <div>
                  <h3 className="font-bold text-xl text-dark-gray capitalize">
                    {view === "weekly" ? `${activeDay} Availability` : `${new Date(selectedDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })} Override`}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {view === "weekly" 
                      ? "Sets recurring slots for this day" 
                      : schedule[selectedDate] 
                        ? "Currently using date-specific override" 
                        : "Using weekly default (Click slots to override)"}
                  </p>
               </div>
               {view === "monthly" && schedule[selectedDate] && (
                 <button 
                  onClick={() => handleClearOverride(selectedDate)}
                  className="flex items-center gap-1.5 text-xs font-bold text-danger hover:underline"
                 >
                   <RotateCcw className="w-3.5 h-3.5" /> Reset
                 </button>
               )}
            </div>
            
            <div className="grid grid-cols-3 gap-3 flex-1">
              {ALL_SLOTS.map(slot => {
                const key = view === "weekly" ? activeDay : selectedDate;
                // If in monthly view and no override exists, show what the default would be as semi-selected?
                // Actually, if no override, we want to start from either empty OR default.
                // Re-reading requirements: "Date wise of the month"
                // Let's make it so clicking in monthly view automatically starts an override.
                const isSelected = schedule[key]?.includes(slot);
                
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(key, slot)}
                    className={`py-3 px-1 text-xs rounded-xl border font-bold transition-all shadow-sm ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-primary/20 scale-95"
                        : "bg-white border-gray-100 text-gray-500 hover:border-primary/40 hover:bg-gray-50"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
               <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Active Slots</span>
                  <span className="font-bold text-dark-gray">{schedule[view === "weekly" ? activeDay : selectedDate]?.length || 0} selected</span>
               </div>
               <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${((schedule[view === "weekly" ? activeDay : selectedDate]?.length || 0) / ALL_SLOTS.length) * 100}%` }}
                  />
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-500 font-bold text-sm hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn-primary px-8 py-2.5 flex items-center gap-3 shadow-lg shadow-primary/25 ${saving ? "opacity-75 cursor-wait" : ""}`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> 
                Sync All Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
