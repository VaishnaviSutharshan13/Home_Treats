/**
 * NotificationBell — Dropdown notification panel
 * Shows a bell icon with unread badge, polls every 10s,
 * and lists notifications in a smooth dropdown.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaBell,
  FaBullhorn,
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
  type: 'announcement' | 'fee' | 'complaint' | 'room' | 'student' | 'booking' | 'payment';
  source: 'Student Management' | 'Fees Management' | 'Complaint Management' | 'Room Management' | 'General Announcement';
  priority: 'normal' | 'important' | 'urgent' | 'success';
  isRead: boolean;
  createdAt: string;
}

const POLL_INTERVAL = 10_000; // 10 seconds

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'announcement' | 'fee' | 'complaint' | 'room' | 'student'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const typeParam = typeFilter === 'all' ? undefined : typeFilter;
      const [notifRes, countRes] = await Promise.all([
        notificationService.getAll({ limit: 30, type: typeParam }),
        notificationService.getUnreadCount(typeParam),
      ]);
      if (notifRes.success) setNotifications(notifRes.data);
      if (countRes.success) setUnreadCount(countRes.unreadCount);
    } catch {
      // Silently fail during polling
    }
  }, [typeFilter]);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [typeFilter]);

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

  const hideNotification = async (id: string) => {
    try {
      await notificationService.hide(id);
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === id);
        if (target && !target.isRead) {
          setUnreadCount((count) => Math.max(count - 1, 0));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <FaBullhorn className="w-4 h-4" />;
      case 'student': return <FaUserGraduate className="w-4 h-4" />;
      case 'complaint': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'room':
      case 'booking': return <FaBed className="w-4 h-4" />;
      case 'fee':
      case 'payment': return <FaMoneyBillWave className="w-4 h-4" />;
      default: return <FaBell className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-surface-active text-primary';
      case 'student': return 'bg-surface-active text-primary';
      case 'complaint': return 'bg-amber-100 text-amber-600';
      case 'room':
      case 'booking': return 'bg-primary/20 text-primary';
      case 'fee':
      case 'payment': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityPill = (priority: Notification['priority']) => {
    if (priority === 'urgent') return 'bg-error/20 border border-error/30 text-error';
    if (priority === 'important') return 'bg-warning/20 border border-warning/30 text-warning';
    if (priority === 'success') return 'bg-primary/20 border border-primary/20 text-primary';
    return 'bg-surface-active text-primary';
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
        className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground/90 transition-colors"
        aria-label="Notifications"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-error/10 border border-error/200 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden transition-all duration-200 origin-top-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-active">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-error/20 border border-error/30 text-error rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="text-xs border border-border rounded-md px-2 py-1 bg-muted/30 text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
              title="Filter notifications"
            >
              <option value="all">All</option>
              <option value="announcement">Announcements</option>
              <option value="student">Student</option>
              <option value="fee">Fees</option>
              <option value="complaint">Complaints</option>
              <option value="room">Room</option>
            </select>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="p-1.5 text-xs text-primary hover:bg-primary/10 text-primary rounded-lg transition disabled:opacity-50"
                title="Mark all as read"
              >
                <FaCheck className="w-3 h-3" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                disabled={loading}
                className="p-1.5 text-xs text-error hover:bg-error/10 border border-error/20 rounded-lg transition disabled:opacity-50"
                title="Clear all"
              >
                <FaTrash className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              title="Close notifications"
              aria-label="Close notifications"
              className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
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
                    ? 'bg-card hover:bg-muted'
                    : 'bg-primary/10 hover:bg-primary/20'
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm leading-snug ${notif.isRead ? 'text-foreground/90' : 'text-foreground font-semibold'}`}>
                      {notif.title}
                    </p>
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-semibold ${getPriorityPill(notif.priority)}`}>
                      {notif.priority}
                    </span>
                  </div>
                  <p className={`text-xs leading-snug ${notif.isRead ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-primary font-medium">{notif.source}</span>
                    <p className="text-[11px] text-muted-foreground">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>

                {/* Unread indicator */}
                <div className="flex-shrink-0 mt-1.5 flex items-center gap-2">
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                  <button
                    type="button"
                    title="Remove from my view"
                    aria-label="Remove from my view"
                    onClick={(e) => {
                      e.stopPropagation();
                      hideNotification(notif._id);
                    }}
                    className="text-muted-foreground hover:text-error"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border bg-surface-active">
            <p className="text-xs text-center text-muted-foreground">
              Showing latest {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
