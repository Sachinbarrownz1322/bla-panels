'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ShieldCheck, Menu, X, Bell, CheckCheck } from 'lucide-react';
import { apiRequest, WEBSITE_BASE_URL } from '../../lib/api';

export default function PortalShell({
  title,
  allowedRoles,
  navItems,
  children,
}) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadNotifications = () => {
    apiRequest('/notifications')
      .then((res) => {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    let active = true;
    apiRequest('/auth/me')
      .then((res) => {
        if (!active) return;
        const u = res.user;
        if (allowedRoles && !allowedRoles.includes(u.roleName)) {
          window.location.href = `${WEBSITE_BASE_URL}/login`;
          return;
        }
        setUser(u);
        setChecking(false);
        loadNotifications();
      })
      .catch(() => {
        if (!active) return;
        window.location.href = `${WEBSITE_BASE_URL}/login`;
      });
    return () => {
      active = false;
    };
  }, [allowedRoles]);

  const handleLogout = async () => {
    setLogoutConfirmOpen(false);
    setToastMsg('Signed out successfully! Redirecting to login...');
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setTimeout(() => {
      window.location.href = `${WEBSITE_BASE_URL}/login`;
    }, 900);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-[#2E3192] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Verifying BLA Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-[#2E3192] via-[#26297d] to-[#1b1d5e] text-white flex flex-col shadow-xl transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl px-2.5 py-1.5 shadow-sm inline-flex items-center">
              <img
                src="/images/logo/logo.png"
                alt="Barrownz Learning Academy"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-[11px] text-sky-200 font-semibold mt-1.5 truncate">{title}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/80 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-[#0071BC] text-white shadow-sm'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="text-xs">
            <p className="font-bold truncate">{user?.name}</p>
            <p className="text-sky-200 text-[11px] truncate">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white/15 text-[10px] font-bold">
              {user?.roleName}
            </span>
          </div>
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-700">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-[#2E3192]">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  if (!notifOpen) loadNotifications();
                }}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2E3192]">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await apiRequest('/notifications/read-all', { method: 'PATCH' });
                          loadNotifications();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0071BC] hover:underline"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n._id}
                          onClick={async () => {
                            if (!n.isRead) {
                              await apiRequest(`/notifications/${n._id}/read`, { method: 'PATCH' });
                              loadNotifications();
                            }
                          }}
                          className={`w-full text-left px-4 py-3 text-xs hover:bg-slate-50 transition ${
                            n.isRead ? 'opacity-65' : 'bg-sky-50/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#0071BC] shrink-0" />}
                          </div>
                          <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <a
              href={WEBSITE_BASE_URL}
              className="text-xs font-semibold text-[#0071BC] hover:underline"
            >
              ← Back to Public Website
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* SweetAlert-style Logout Confirmation Modal */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2E3192]">Sign Out?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to sign out of your BLA Portal session?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toastify-style Floating Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[60] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
