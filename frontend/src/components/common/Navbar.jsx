import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Headphones, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const { isAdmin } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant">
      <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between">
        <div className="flex items-center gap-space-lg">
          <Link to="/tickets" className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <span className="font-title-md text-title-md text-on-surface tracking-tight">
              SupportDesk
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-space-sm">
            <NavLink
              to="/tickets"
              end
              className={({ isActive }) =>
                `px-space-md py-space-sm transition-colors rounded-lg font-body-md text-body-md ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              My Tickets
            </NavLink>
            <NavLink
              to="/tickets/new"
              className={({ isActive }) =>
                `px-space-md py-space-sm transition-colors rounded-lg font-body-md text-body-md ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              Submit Ticket
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin/dashboard"
                className="px-space-md py-space-sm rounded-lg font-body-md text-body-md text-primary font-medium hover:bg-primary-fixed transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-space-md">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
