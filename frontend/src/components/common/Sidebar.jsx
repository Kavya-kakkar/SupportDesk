import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Inbox,
  History,
  ShieldCheck,
  LogOut,
  Headphones,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AccountDetailsModal } from './ProfileDropdown';

export default function Sidebar() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Tickets', to: '/admin/tickets', icon: Ticket },
    { label: 'Support Queue', to: '/admin/queue', icon: Inbox },
    { label: 'Activity Logs', to: '/admin/activity', icon: History },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant z-50 flex flex-col justify-between">
      <div className="flex flex-col">
        {/* Brand header */}
        <div className="h-16 px-margin flex items-center gap-space-sm border-b border-outline-variant">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="font-title-md text-title-md text-on-surface tracking-tight">
            SupportDesk
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-space-xs p-space-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors font-body-md text-body-md ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout bottom card */}
      <div className="p-space-md border-t border-outline-variant flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity cursor-pointer min-w-0"
          title="View Account Profile"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-xs shrink-0">
            {user?.name ? user.name.substring(0, 1).toUpperCase() : 'A'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-on-surface truncate">
              {user?.name || 'Support Admin'}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Operations
            </span>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to="/tickets"
            title="Switch to Customer View"
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-primary" />
          </Link>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AccountDetailsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </aside>
  );
}
