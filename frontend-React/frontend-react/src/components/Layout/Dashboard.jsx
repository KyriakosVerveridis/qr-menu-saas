import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Stats Cards Example */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <p className="text-sm text-slate-500">Metric {i}</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
              ))}
            </div>

            {/* Main Outlet Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
               <Outlet /> 
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}