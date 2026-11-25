import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Building,
  Mail,
  LogOut,
  ChevronDown,
  ExternalLink,
  PlusCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AccountDetailsModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;
  const initial = user?.name ? user.name.substring(0, 1).toUpperCase() : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant w-full max-w-md overflow-hidden">
        <div className="p-space-lg border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-title-md text-title-md text-on-surface">Account Profile</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-space-lg flex flex-col gap-4">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-container-low">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
              {initial}
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-on-surface font-semibold">{user?.name}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant capitalize">Role: {user?.role}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 font-body-sm text-body-sm">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-outline-variant">
              <span className="text-on-surface-variant flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Email
              </span>
              <span className="font-medium text-on-surface">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-outline-variant">
              <span className="text-on-surface-variant flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" /> Workspace
              </span>
              <span className="font-medium text-on-surface">{user?.organization || 'Acme Support Ops'}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-outline-variant">
              <span className="text-on-surface-variant flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#059669]" /> Account Status
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#059669] font-label-sm text-label-sm font-semibold">
                Active &amp; Verified
              </span>
            </div>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-low border-t border-outline-variant flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-white font-title-sm text-title-sm hover:bg-secondary transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const initial = user?.name ? user.name.substring(0, 1).toUpperCase() : 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clickable Profile Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-left select-none border border-transparent hover:border-outline-variant"
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-sm shadow-sm shrink-0">
          {initial}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="font-label-md text-label-md text-on-surface font-semibold max-w-[120px] truncate">
            {user?.name || 'Demo User'}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant capitalize">
            {user?.role === 'admin' ? 'Support Admin' : 'Customer'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Card */}
          <div className="p-4 bg-surface-container-low border-b border-outline-variant flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-base shadow-sm shrink-0">
              {initial}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-title-sm text-title-sm text-on-surface font-semibold truncate">
                  {user?.name || 'User'}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                    user?.role === 'admin'
                      ? 'bg-primary-container text-white'
                      : 'bg-primary-fixed text-primary'
                  }`}
                >
                  {user?.role || 'user'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Organization metadata */}
          <div className="px-4 py-2.5 bg-surface-container-lowest border-b border-outline-variant text-label-md text-on-surface-variant flex items-center gap-2">
            <Building className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">Workspace: <strong>{user?.organization || 'Acme Support Ops'}</strong></span>
          </div>

          {/* Action Links */}
          <div className="p-1.5 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowModal(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm font-body-sm text-on-surface hover:bg-surface-container transition-colors text-left cursor-pointer"
            >
              <User className="w-4 h-4 text-on-surface-variant" />
              <span>Account Details</span>
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/tickets');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm font-body-sm text-on-surface hover:bg-surface-container transition-colors text-left cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
                <span>Customer Portal View</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/tickets/new');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm font-body-sm text-on-surface hover:bg-surface-container transition-colors text-left cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>Submit New Ticket</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/admin/dashboard');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm font-body-sm text-primary hover:bg-primary-fixed transition-colors text-left cursor-pointer font-medium"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Operations Console</span>
              </button>
            )}
          </div>

          {/* Sign Out Button */}
          <div className="p-1.5 border-t border-outline-variant bg-surface-container-low/40">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm font-body-sm text-error hover:bg-error-container hover:text-on-error-container transition-colors text-left cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      <AccountDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={user}
      />
    </div>
  );
}
