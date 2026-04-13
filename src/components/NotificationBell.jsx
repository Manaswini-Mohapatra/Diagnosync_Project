import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Loader } from 'lucide-react';
import api from '../utils/api';

/**
 * NotificationBell — Global notification icon for all dashboard navbars
 *
 * Features:
 *  - Shows unread count badge (polls every 30 seconds)
 *  - Click to open dropdown with recent notifications
 *  - Mark individual notification as read
 *  - Mark all as read button
 *  - Auto-closes when clicking outside
 *
 * Usage:
 *  <NotificationBell />
 */
function NotificationBell() {
  const [unreadCount, setUnreadCount]       = useState(0);
  const [notifications, setNotifications]   = useState([]);
  const [isOpen, setIsOpen]                 = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const dropdownRef                         = useRef(null);

  // ── Fetch unread count (lightweight, runs every 30s) ──────────────────
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch {
      // Silent fail — don't disrupt the page if notifications fail
    }
  };

  // ── Fetch full notification list (only when dropdown opens) ───────────
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch {
      setError('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  // ── Mark single notification as read ──────────────────────────────────
  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Silent fail
    }
  };

  // ── Mark all as read ──────────────────────────────────────────────────
  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/all/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silent fail
    }
  };

  // ── Toggle dropdown + load notifications ─────────────────────────────
  const handleBellClick = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen(prev => !prev);
  };

  // ── Close dropdown when clicking outside ──────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Poll unread count every 30 seconds ───────────────────────────────
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const typeColor = (type) => {
    const map = {
      appointment: 'bg-blue-100 text-blue-700',
      prescription: 'bg-green-100 text-green-700',
      reminder:    'bg-yellow-100 text-yellow-700',
      alert:       'bg-red-100 text-red-700',
      message:     'bg-purple-100 text-purple-700',
    };
    return map[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="relative" ref={dropdownRef}>

      {/* ── Bell Button ── */}
      <button
        onClick={handleBellClick}
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  All read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            )}

            {error && (
              <div className="px-4 py-6 text-center text-sm text-red-500">{error}</div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            )}

            {!loading && !error && notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.read && markAsRead(n._id)}
                className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !n.read ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(n.type)}`}>
                        {n.type}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-xs text-gray-400">Click a notification to mark it as read</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
