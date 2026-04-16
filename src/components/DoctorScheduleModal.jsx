import React, { useState, useEffect } from "react";
import { X, Save, Clock } from "lucide-react";
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
  const [activeDay, setActiveDay] = useState("monday");

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

  const toggleSlot = (day, slot) => {
    setSchedule(prev => {
      const daySlots = prev[day] || [];
      if (daySlots.includes(slot)) {
        return { ...prev, [day]: daySlots.filter(s => s !== slot) };
      } else {
        // Keep them sorted according to ALL_SLOTS order
        const newSlots = [...daySlots, slot].sort((a, b) => ALL_SLOTS.indexOf(a) - ALL_SLOTS.indexOf(b));
        return { ...prev, [day]: newSlots };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/doctors/me", { availableSlots: schedule });
      alert("Schedule updated successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to save schedule:", err);
      alert("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 text-center">
          Loading schedule...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark-gray">My Schedule</h2>
              <p className="text-sm text-gray-500">Set your weekly availability for patients</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar for days */}
          <div className="w-1/3 border-r border-gray-100 bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-1">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`w-full text-left px-4 py-3 rounded-lg capitalize font-medium transition-colors ${
                    activeDay === day
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {day}
                  {(schedule[day]?.length > 0) && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeDay === day ? 'bg-white/20' : 'bg-gray-200'}`}>
                      {schedule[day].length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main content for slots */}
          <div className="w-2/3 p-6 overflow-y-auto bg-white">
            <h3 className="font-bold text-lg capitalize mb-4 text-dark-gray border-b pb-2">
              {activeDay} Availability
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {ALL_SLOTS.map(slot => {
                const isSelected = schedule[activeDay]?.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(activeDay, slot)}
                    className={`py-2 px-1 text-sm rounded-lg border font-medium transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-white border-gray-200 text-gray-600 hover:border-primary/40 hover:bg-gray-50"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Schedule</>}
          </button>
        </div>
      </div>
    </div>
  );
}
