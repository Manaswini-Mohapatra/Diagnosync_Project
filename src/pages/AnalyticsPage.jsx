import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar, 
  PieChart as PieChartIcon, 
  Filter, 
  Video, 
  UserPlus, 
  Activity,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import NotificationBell from "../components/NotificationBell";
import api from "../utils/api";

const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"];

function AnalyticsPage({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("week"); // today, week, month
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/doctor?range=${range}`);
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [range]);

  const handleLogout = () => { onLogout(); navigate("/"); };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium tracking-wide">Analyzing Clinical Data...</p>
        </div>
      </div>
    );
  }

  const { summary, trends, distribution, patientRetention } = data || {};

  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/doctor/dashboard")} 
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />Back to Dashboard
              </button>
              <NotificationBell />
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-dark-gray mb-2">Clinical Analytics</h1>
            <p className="text-gray-600">Deep insights into your practice performance and patient trends.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {["today", "week", "month"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  range === r 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Consultations</p>
            <h3 className="text-3xl font-black text-dark-gray mt-1">{summary.totalConsultations}</h3>
            <p className="text-xs text-gray-400 mt-2">{summary.rangeConsultations} in selected period</p>
          </div>

          <div className="card border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <ChevronUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Retention Rate</p>
            <h3 className="text-3xl font-black text-dark-gray mt-1">{summary.retentionRate}%</h3>
            <p className="text-xs text-gray-400 mt-2">Recurring vs unique patients</p>
          </div>

          <div className="card border-l-4 border-pink-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Clock className="w-6 h-6 text-pink-500" />
              </div>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Avg. Duration</p>
            <h3 className="text-3xl font-black text-dark-gray mt-1">{summary.avgDuration}m</h3>
            <p className="text-xs text-gray-400 mt-2">Minutes per session</p>
          </div>

          <div className="card border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <UserPlus className="w-6 h-6 text-orange-500" />
              </div>
              <ChevronDown className="w-4 h-4 text-warning" />
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">New Patients</p>
            <h3 className="text-3xl font-black text-dark-gray mt-1">{patientRetention.new}</h3>
            <p className="text-xs text-gray-400 mt-2">Acquired in this period</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Trends Chart */}
          <div className="lg:col-span-2 card">
            <h3 className="text-xl font-bold text-dark-gray mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Consultations Over Time
            </h3>
            <div className="h-[350px] w-full">
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="consultations" 
                      stroke="#3B82F6" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">
                  Not enough historical data to generate trends.
                </div>
              )}
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="card">
            <h3 className="text-xl font-bold text-dark-gray mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Consultation Mix
            </h3>
            <div className="h-[300px] w-full">
              {distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic text-center px-4">
                  No consultation type data available for distribution analysis.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Retention & Insights Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="card bg-gradient-to-br from-primary to-blue-700 text-white border-none shadow-xl shadow-primary/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Patient Retention Insight
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/70 text-sm font-medium">Returning Patients</p>
                  <p className="text-4xl font-black">{patientRetention.returning}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm font-medium">Retention Rate</p>
                  <p className="text-4xl font-black">{patientRetention.rate}%</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/80">
                  <span>Growth Index</span>
                  <span>{patientRetention.rate > 50 ? 'Healthy' : 'Stabilizing'}</span>
                </div>
                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="bg-white h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                    style={{ width: `${patientRetention.rate}%` }}
                  />
                </div>
              </div>
              
              <p className="text-sm text-blue-100 italic leading-relaxed">
                Your practice has a {patientRetention.rate}% retention rate. 
                Focus on follow-up protocols to increase recurring patient consultations.
              </p>
            </div>
          </div>

          <div className="card flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-purple-50 rounded-2xl">
                <Video className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-gray">Tele-Medicine Adoption</h3>
                <p className="text-sm text-gray-600">Video consultations vs physical visits</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter mb-1">Video Calls</p>
                <p className="text-2xl font-black text-purple-600">
                  {distribution.find(d => d.name === 'Video Call')?.value || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter mb-1">In-Person</p>
                <p className="text-2xl font-black text-blue-600">
                  {distribution.find(d => d.name === 'In-Person')?.value || 0}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-success font-bold">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              Adoption is consistent with industry standards.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AnalyticsPage;
