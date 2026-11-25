import React from 'react';
import Navbar from '../common/Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-body-md text-on-surface">
      <Navbar />
      <main className="w-full pt-16 bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-margin py-space-lg">
          {children}
        </div>
      </main>
    </div>
  );
}
