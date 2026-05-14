import React, { useState, useEffect } from "react";
import { LogOut, Activity, Users, FileCheck, Calendar, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Logo from "../../components/Logo";

function AdminDashboard({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        setStats(res.data.stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/signin');
  };

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-gray-200/50 hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-gray-200 overflow-hidden">
          <Logo size="small" clickable={false} />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary font-semibold rounded-xl transition-colors"
          >
            <Activity className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors"
          >
            <Users className="w-5 h-5" />
            User Management
          </Link>
          <Link
            to="/admin/appointments"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Appointments
          </Link>
          <Link
            to="/admin/doctors/verify"
            className="flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5" />
              Verifications
            </div>
            {stats.pendingDoctors > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.pendingDoctors}
              </span>
            )}
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors"
          >
            <Activity className="w-5 h-5" />
            Analytics
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-semibold text-sm text-dark-gray">{currentUser?.name || 'System Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-red-50 font-medium rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10 overflow-hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 text-gray-600 hover:text-primary rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <Logo size="small" clickable={false} />
          </div>
          <button onClick={handleLogout} className="p-2 text-danger hover:bg-red-50 rounded-lg shrink-0">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 w-64 glass-panel shadow-xl z-50 md:hidden flex flex-col"
              >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <Logo size="small" clickable={false} />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary font-semibold rounded-xl transition-colors">
                    <Activity className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link to="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
                    <Users className="w-5 h-5" /> User Management
                  </Link>
                  <Link to="/admin/appointments" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
                    <Calendar className="w-5 h-5" /> Appointments
                  </Link>
                  <Link to="/admin/doctors/verify" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
                    <div className="flex items-center gap-3"><FileCheck className="w-5 h-5" /> Verifications</div>
                    {stats.pendingDoctors > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{stats.pendingDoctors}</span>}
                  </Link>
                </nav>
                <div className="p-4 border-t border-gray-200">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-red-50 font-medium rounded-xl transition-colors">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-dark-gray">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">System overview and key metrics</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Users */}
            <div className="glass-panel p-6 rounded-2xl border-none shadow-soft hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-primary rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-dark-gray mb-1">
                {isLoading ? '-' : stats.totalUsers}
              </h3>
              <p className="text-gray-500 font-medium text-sm">Total Users</p>
            </div>

            {/* Total Patients */}
            <div className="glass-panel p-6 rounded-2xl border-none shadow-soft hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-dark-gray mb-1">
                {isLoading ? '-' : stats.totalPatients}
              </h3>
              <p className="text-gray-500 font-medium text-sm">Patients</p>
            </div>

            {/* Total Doctors */}
            <div className="glass-panel p-6 rounded-2xl border-none shadow-soft hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-dark-gray mb-1">
                {isLoading ? '-' : stats.totalDoctors}
              </h3>
              <p className="text-gray-500 font-medium text-sm">Verified Doctors</p>
            </div>

            {/* Pending Verifications */}
            <div className="glass-panel p-6 rounded-2xl border-none shadow-soft hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => navigate('/admin/doctors/verify')}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <FileCheck className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-dark-gray mb-1">
                {isLoading ? '-' : stats.pendingDoctors}
              </h3>
              <p className="text-amber-700 font-medium text-sm">Pending Verifications</p>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border-none shadow-soft">
                <h3 className="text-lg font-bold text-dark-gray mb-4">Quick Actions</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button onClick={() => navigate('/admin/doctors/verify')} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-blue-50 transition-all text-left group">
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-gray">Verify Doctors</h4>
                      <p className="text-xs text-gray-500">Review pending applications</p>
                    </div>
                  </button>
                  <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-blue-50 transition-all text-left group">
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-gray">Manage Users</h4>
                      <p className="text-xs text-gray-500">View and update user status</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border-none shadow-soft">
               <h3 className="text-lg font-bold text-dark-gray mb-4">System Status</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-600">API Servers</span>
                     <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium text-gray-600">Database</span>
                     <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-green-500"></span> Connected</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
