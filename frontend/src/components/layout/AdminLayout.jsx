import React from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface flex">
      <Sidebar />
      <div className="pl-64 w-full flex flex-col">
        <Header />
        <main className="relative pt-16 bg-surface min-h-screen">
          <div className="w-full px-margin py-space-lg">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
