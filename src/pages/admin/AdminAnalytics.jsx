import React, { useState, useEffect, useRef } from 'react';
import { Download, Calendar, Activity, AlertCircle, Users, FileCheck, LogOut, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Papa from 'papaparse';
import api from '../../utils/api';
import Logo from '../../components/Logo';
import AnalyticsCards from '../../components/admin/AnalyticsCards';
import AnalyticsCharts from '../../components/admin/AnalyticsCharts';

const AdminAnalytics = ({ onLogout, currentUser }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('monthly');
  const reportRef = useRef();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/analytics/admin?range=${timeRange}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Could not load analytics data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 0.5,
      filename: `diagnosync-analytics-${timeRange}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleExportCSV = () => {
    if (!data) return;
    
    // Combine summary data into a flat structure
    const csvData = [
      { Metric: 'Total Patients', Value: data.summary.totalPatients },
      { Metric: 'Total Doctors', Value: data.summary.totalDoctors },
      { Metric: 'Active Users', Value: data.summary.activeUsers },
      { Metric: 'New Users This Month', Value: data.summary.newUsersThisMonth },
      { Metric: 'Total Symptom Analyses', Value: data.summary.totalSymptomAnalyses },
      { Metric: 'Total Appointments', Value: data.summary.totalAppointments },
      { Metric: 'Retention Rate %', Value: data.summary.retentionRate }
    ];
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `diagnosync-summary-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Error Loading Analytics</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-gray-200/50 hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-gray-200 overflow-hidden">
          <Logo size="small" clickable={false} />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <Activity className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <Users className="w-5 h-5" /> User Management
          </Link>
          <Link to="/admin/appointments" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <Calendar className="w-5 h-5" /> Appointments
          </Link>
          <Link to="/admin/doctors/verify" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <FileCheck className="w-5 h-5" /> Verifications
          </Link>
          <Link to="/admin/analytics" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary font-semibold rounded-xl transition-colors">
            <Activity className="w-5 h-5" /> Analytics
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={() => { onLogout(); navigate('/signin'); }} className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-red-50 font-medium rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10 overflow-hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 text-gray-600 hover:text-primary rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <Logo size="small" clickable={false} />
          </div>
          <button onClick={() => { onLogout(); navigate('/signin'); }} className="p-2 text-danger hover:bg-red-50 rounded-lg shrink-0">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        
        <div className="p-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            Platform Analytics
          </h1>
          <p className="text-gray-500 mt-1">Real-time healthcare insights and system performance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-10 pr-8 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="weekly">Last 7 Days (Weekly)</option>
              <option value="monthly">Last 30 Days (Monthly)</option>
              <option value="yearly">Last 12 Months (Yearly)</option>
            </select>
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          <div className="flex glass-panel border-none rounded-lg shadow-soft overflow-hidden">
            <button 
              onClick={handleExportCSV}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-r border-gray-200 transition-colors"
            >
              CSV
            </button>
            <button 
              onClick={handleExportPDF}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={reportRef} className="glass-panel border-none p-2 rounded-xl">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl w-full"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72 bg-gray-200 rounded-xl"></div>
              <div className="h-72 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ) : (
          <>
            <AnalyticsCards summary={data?.summary} />
            <AnalyticsCharts charts={data?.charts} />
          </>
        )}
      </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
