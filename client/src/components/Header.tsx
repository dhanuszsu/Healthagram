import React, { useState, useEffect } from 'react';
import { User, Notification } from '../types';
import { api, setStoredToken } from '../api';
import {
  Bell,
  LogOut,
  RefreshCw,
  LayoutDashboard,
  FileText,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  currentView: 'dashboard' | 'patient' | 'approach';
  onSelectView: (view: 'dashboard' | 'patient' | 'approach') => void;
  onUserChanged: (user: User | null) => void;
  onRefreshData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentView,
  onSelectView,
  onUserChanged,
  onRefreshData
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [switching, setSwitching] = useState(false);

  const fetchNotifs = async () => {
    if (!currentUser) return;
    try {
      const list = await api.getNotifications();
      setNotifications(list);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const quickSwitch = async (email: string) => {
    setSwitching(true);
    try {
      const res = await api.login(email, 'Password123!');
      setStoredToken(res.token);
      onUserChanged(res.user);
      onRefreshData();
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    onUserChanged(null);
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'SENIOR_DOCTOR') return 'Senior Doctor';
    if (role === 'JUNIOR_DOCTOR') return 'Junior Doctor';
    if (role === 'SPECIALIST') return 'Specialist';
    return role || '';
  };

  const getAvatarClass = (role?: string) => {
    if (role === 'SENIOR_DOCTOR') return 'avatar-senior';
    if (role === 'SPECIALIST') return 'avatar-specialist';
    return 'avatar-junior';
  };

  return (
    <header className="header">
      {/* Left: Branding & Core Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
        <div className="brand" onClick={() => onSelectView('dashboard')} style={{ cursor: 'pointer' }}>
          <span className="brand-title">HEALTHAGRAM</span>
        </div>

        {currentUser && (
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              className={`btn-switch ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onSelectView('dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LayoutDashboard size={13} />
              <span>Dashboard</span>
            </button>

            <button
              className={`btn-switch ${currentView === 'patient' ? 'active' : ''}`}
              onClick={() => onSelectView('patient')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <FileText size={13} />
              <span>Shared Patient Record</span>
            </button>

            {/* Senior Approach appears ONLY for Junior Doctor */}
            {currentUser.role === 'JUNIOR_DOCTOR' && (
              <button
                className={`btn-switch ${currentView === 'approach' ? 'active' : ''}`}
                onClick={() => onSelectView('approach')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <BookOpen size={13} />
                <span>Senior Approach</span>
              </button>
            )}
          </nav>
        )}
      </div>

      {/* Middle: Fast Doctor Simulation Switcher */}
      <div className="quick-switch-bar">
        <span className="switch-label">Role:</span>
        <button
          className={`btn-switch ${currentUser?.email === 'suresh@healthagram.clinic' ? 'active' : ''}`}
          onClick={() => quickSwitch('suresh@healthagram.clinic')}
          disabled={switching}
          title="Login as Dr. Suresh (Senior Doctor)"
        >
          Senior (Dr. Suresh)
        </button>
        <button
          className={`btn-switch ${currentUser?.email === 'ananya@healthagram.clinic' ? 'active' : ''}`}
          onClick={() => quickSwitch('ananya@healthagram.clinic')}
          disabled={switching}
          title="Login as Dr. Ananya (Junior Doctor)"
        >
          Junior (Dr. Ananya)
        </button>
        <button
          className={`btn-switch ${currentUser?.email === 'swetha@healthagram.clinic' ? 'active' : ''}`}
          onClick={() => quickSwitch('swetha@healthagram.clinic')}
          disabled={switching}
          title="Login as Dr. Swetha (Specialist)"
        >
          Specialist (Dr. Swetha)
        </button>
      </div>

      {/* Right: Clean, Compact User Area */}
      <div className="header-user-section">
        <button
          className="btn-switch"
          onClick={onRefreshData}
          title="Refresh Data"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.5rem' }}
        >
          <RefreshCw size={13} />
        </button>

        {currentUser && (
          <>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn-switch"
                onClick={() => setShowNotifs(!showNotifs)}
                style={{ display: 'flex', alignItems: 'center', padding: '0.25rem 0.5rem', position: 'relative' }}
                title="Notifications"
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.05rem 0.3rem',
                      borderRadius: '9999px',
                      marginLeft: '0.25rem'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div
                  style={{
                    position: 'absolute',
                    top: '2.2rem',
                    right: 0,
                    width: '320px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 100
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderBottom: '1px solid #e2e8f0',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      color: '#475569',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>NOTIFICATIONS</span>
                    <span>{notifications.length} alerts</span>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '0.8rem',
                            background: !n.isRead ? '#f8fafc' : '#ffffff',
                            cursor: 'pointer'
                          }}
                          onClick={async () => {
                            if (!n.isRead) {
                              await api.markNotificationRead(n.id);
                              fetchNotifs();
                            }
                          }}
                        >
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{n.title}</div>
                          <div style={{ color: '#475569', fontSize: '0.75rem' }}>{n.message}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Compact Doctor Info */}
            <div className="doctor-badge-container">
              <div className={`doctor-avatar ${getAvatarClass(currentUser.role)}`}>
                {currentUser.firstName[0]}
                {currentUser.lastName[0]}
              </div>
              <div className="doctor-info-text">
                <span className="doctor-name">
                  Dr. {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="doctor-role-title">
                  {getRoleLabel(currentUser.role)}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn-switch"
              title="Logout"
              style={{ color: '#fca5a5', padding: '0.25rem 0.5rem' }}
            >
              <LogOut size={13} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
