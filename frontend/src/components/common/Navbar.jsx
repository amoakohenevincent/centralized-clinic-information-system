import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentUser, activeRole, switchRole } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'create', label: 'Create Prescription', role: 'doctor', icon: 'M12 4v16m8-8H4' },
    { id: 'catalogue', label: 'Medicine Catalogue', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'history', label: 'Prescription History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Bar with System Branding & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              Rx
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  CCIS — Prescription Management
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-teal-100 text-teal-800">
                  Module 3
                </span>
              </div>
              <p className="text-xs text-slate-500">University Clinic Information System</p>
            </div>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="flex items-center gap-4">
            {/* Simulation Role Selector for Evaluation */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <span className="px-2 text-slate-500 text-[11px] font-semibold">Simulate Role:</span>
              <button
                type="button"
                onClick={() => switchRole('doctor')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeRole === 'doctor'
                    ? 'bg-teal-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Doctor (MD)
              </button>
              <button
                type="button"
                onClick={() => switchRole('pharmacist')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeRole === 'pharmacist'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pharmacist (Sarah)
              </button>
              <button
                type="button"
                onClick={() => switchRole('nurse')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeRole === 'nurse'
                    ? 'bg-purple-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nurse
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.department}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-300">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-100 py-1 overflow-x-auto">
          {navItems.map((item) => {
            const isRestricted = item.role && item.role !== activeRole;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => !isRestricted && setActiveTab(item.id)}
                disabled={isRestricted}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : isRestricted
                    ? 'text-slate-300 cursor-not-allowed opacity-60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={isRestricted ? `Only accessible to ${item.role}` : ''}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                <span>{item.label}</span>
                {isRestricted && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-400">
                    {item.role}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
