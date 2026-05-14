import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, UserPlus, Activity, 
  Video, Calendar, Stethoscope, RefreshCw,
  HeartPulse, ShieldAlert
} from 'lucide-react';

const AnalyticsCards = ({ summary }) => {
  const cards = [
    { title: 'Total Patients', value: summary?.totalPatients || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Doctors', value: summary?.totalDoctors || 0, icon: Stethoscope, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Active Users', value: summary?.activeUsers || 0, icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'New Users (Month)', value: summary?.newUsersThisMonth || 0, icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Symptom Analyses', value: summary?.totalSymptomAnalyses || 0, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
    { title: 'Video Consults', value: summary?.totalVideoConsultations || 0, icon: Video, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { title: 'In-Person Visits', value: summary?.totalInPersonConsultations || 0, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Total Appointments', value: summary?.totalAppointments || 0, icon: HeartPulse, color: 'text-teal-500', bg: 'bg-teal-50' },
    { title: 'Avg Analyses/User', value: summary?.averageSymptomAnalysesPerUser || 0, icon: ShieldAlert, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
    { title: 'Retention Rate', value: `${summary?.retentionRate || 0}%`, icon: RefreshCw, color: 'text-emerald-500', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glass-panel rounded-xl shadow-soft border-none p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{card.value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AnalyticsCards;
