import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1">
        <TopHeader />
        
        <div className="p-8">
           <h1>Dashboard Content</h1> 
           <Outlet /> 
        </div>
      </main>
    </div>
  );
}