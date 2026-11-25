import React from 'react';
import { Search, Bell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant z-40 px-margin flex items-center justify-between">
      <div className="flex items-center gap-space-sm">
        <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <span className="font-label-md text-label-md text-on-surface-variant font-medium">
          Admin Console
        </span>
      </div>

      <div className="flex items-center gap-space-md">
        <button
          onClick={() => navigate('/admin/tickets')}
          title="Search Tickets"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/admin/activity')}
          title="Audit Notifications"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-primary absolute top-1 right-1" />
        </button>

        <div className="pl-2 border-l border-outline-variant">
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
