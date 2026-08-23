import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import PhonePreview from './PhonePreview';
import MobileBottomNav from './MobileBottomNav';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-y-6 md:divide-x md:divide-slate-300">
            <Outlet />
          </div>
        </div>

          <div className="hidden lg:block w-[360px] border-l border-slate-200 bg-white flex-shrink-0">
            <PhonePreview />
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}