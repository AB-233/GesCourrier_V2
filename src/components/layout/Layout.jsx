
import React from 'react';
import Sidebar from '@/components/layout/Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
  