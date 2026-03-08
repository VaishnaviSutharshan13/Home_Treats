/**
 * NotificationBell — Dropdown notification panel
 * Shows a bell icon with unread badge, polls every 10s,
 * and lists notifications in a smooth dropdown.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaBell,
  FaUserGraduate,
  FaExclamationTriangle,
  FaBed,
  FaMoneyBillWave,
  FaCheck,
  FaTrash,
  FaTimes,
} from 'react-icons/fa';
import { notificationService } from '../services';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'student' | 'complaint' | 'booking' | 'payment';
  isRead: boolean;
  createdAt: string;
}

const POLL_INTERVAL = 10_000; // 10 seconds

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationService.getAll(20),
        notificationService.getUnreadCount(),
      ]);
      if (notifRes.success) setNotifications(notifRes.data);
      if (countRes.success) setUnreadCount(countRes.unreadCount);
    } catch {
      // Silently fail during polling
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch { /* ignore */ }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    try {
      setLoading(true);
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'student': return <FaUserGraduate className="w-4 h-4" />;
      case 'complaint': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'booking': return <FaBed className="w-4 h-4" />;
      case 'payment': return <FaMoneyBillWave className="w-4 h-4" />;
      default: return <FaBell className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'student': return 'bg-blue-100 text-blue-600';
      case 'complaint': return 'bg-amber-100 text-amber-600';
      case 'booking': return 'bg-emerald-100 text-emerald-600';
      case 'payment': return 'bg-violet-100 text-violet-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) !== 1 ? 's' : ''} ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden transition-all duration-200 origin-top-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="p-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                title="Mark all as read"
              >
                <FaCheck className="w-3 h-3" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                disabled={loading}
                className="p-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Clear all"
              >
                <FaTrash className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <FaBell className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  notif.isRead
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-blue-50/50 hover:bg-blue-50'
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>

                {/* Unread indicator */}
                {!notif.isRead && (
                  <div className="flex-shrink-0 mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-center text-gray-400">
              Showing latest {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
