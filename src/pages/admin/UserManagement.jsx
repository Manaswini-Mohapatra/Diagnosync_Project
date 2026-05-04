import React, { useState, useEffect } from "react";
import { Users, Activity, FileCheck, LogOut, Search, UserCheck, UserX, Loader, Calendar, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Logo from "../../components/Logo";

function UserManagement({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Only fetch basic users list for now. Search is client-side in this simple MVP.
      // If backend adds ?search= query, we could use that.
      const query = new URLSearchParams({ page, limit: 10 });
      if (roleFilter) query.append('role', roleFilter);
      
      const res = await api.get(`/users?${query.toString()}`);
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      const res = await api.patch(`/users/${userId}/status`, { isActive: !currentStatus });
      if (res.data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      }
    } catch (error) {
      console.error("Error updating status", error);
      alert("Failed to update user status.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200 overflow-hidden">
          <Logo size="small" clickable={false} />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <Activity className="w-5 h-5" /> Dashboard
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary font-semibold rounded-xl transition-colors">
            <Users className="w-5 h-5" /> User Management
          </Link>
          <Link to="/admin/appointments" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <Calendar className="w-5 h-5" /> Appointments
          </Link>
          <Link to="/admin/doctors/verify" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
            <FileCheck className="w-5 h-5" /> Verifications
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
                className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 md:hidden flex flex-col"
              >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <Logo size="small" clickable={false} />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
                    <Activity className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link to="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary font-semibold rounded-xl transition-colors">
                    <Users className="w-5 h-5" /> User Management
                  </Link>
                  <Link to="/admin/appointments" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
                    <Calendar className="w-5 h-5" /> Appointments
                  </Link>
                  <Link to="/admin/doctors/verify" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary font-medium rounded-xl transition-colors">
                    <FileCheck className="w-5 h-5" /> Verifications
                  </Link>
                </nav>
                <div className="p-4 border-t border-gray-200">
                  <button onClick={() => { onLogout(); navigate('/signin'); }} className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-red-50 font-medium rounded-xl transition-colors">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-gray">User Management</h1>
            <p className="text-gray-500 mt-1">Manage all accounts in the system.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="input-field pr-10 bg-gray-50 border-transparent focus:bg-white focus:border-primary w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="input-field bg-gray-50 border-transparent focus:bg-white focus:border-primary sm:w-48"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto md:overflow-visible">
              <table className="w-full text-left border-collapse block md:table">
                <thead className="hidden md:table-header-group">
                  <tr className="border-b border-gray-100 text-sm text-gray-500">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm block md:table-row-group">
                  {isLoading ? (
                    <tr className="block md:table-row"><td colSpan="5" className="py-8 text-center text-gray-500 block md:table-cell"><Loader className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading users...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr className="block md:table-row"><td colSpan="5" className="py-8 text-center text-gray-500 block md:table-cell">No users found.</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="block md:table-row border border-gray-100 md:border-b md:border-gray-50 md:border-x-0 md:border-t-0 rounded-xl md:rounded-none mb-4 md:mb-0 p-4 md:p-0 hover:bg-gray-50/50 transition-colors bg-white">
                        <td className="flex md:table-cell justify-between items-center py-2 md:py-4 font-medium text-dark-gray border-b border-gray-50 md:border-none">
                          <span className="md:hidden text-gray-500 font-normal">Name</span>
                          {user.name}
                        </td>
                        <td className="flex md:table-cell justify-between items-center py-2 md:py-4 text-gray-600 border-b border-gray-50 md:border-none">
                          <span className="md:hidden text-gray-500 font-normal">Email</span>
                          {user.email}
                        </td>
                        <td className="flex md:table-cell justify-between items-center py-2 md:py-4 border-b border-gray-50 md:border-none">
                          <span className="md:hidden text-gray-500 font-normal">Role</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'doctor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="flex md:table-cell justify-between items-center py-2 md:py-4 border-b border-gray-50 md:border-none">
                          <span className="md:hidden text-gray-500 font-normal">Status</span>
                          <span className={`flex items-center gap-1 text-xs font-semibold ${user.isActive ? 'text-green-600' : 'text-danger'}`}>
                            <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-danger'}`}></span>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="flex md:table-cell justify-between items-center py-3 md:py-4 md:text-right pt-4 md:pt-4">
                          <span className="md:hidden text-gray-500 font-normal">Action</span>
                          <button
                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                            disabled={user.role === 'admin' || actionLoading === user._id}
                            className={`px-4 py-2 min-h-[44px] md:min-h-0 md:px-3 md:py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                              user.role === 'admin' ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50' :
                              user.isActive ? 'border-danger text-danger hover:bg-red-50' : 'border-green-500 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {actionLoading === user._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 
                             user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserManagement;
