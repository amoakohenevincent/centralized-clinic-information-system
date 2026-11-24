import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentUser, activeRole, switchRole } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'create', label: 'Create Prescription', role: 'doctor' },
    { id: 'catalogue', label: 'Medicine Catalogue' },
    { id: 'history', label: 'Prescription History' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 md:h-16 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
              Rx
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  CCIS Prescription Management
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
                  Module 3
                </span>
              </div>
              <p className="text-xs text-slate-500">University Clinic Information System</p>
            </div>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs font-medium">
              <span className="px-2 text-slate-500 text-[11px] font-semibold hidden sm:inline">Role:</span>
              <button
                type="button"
                onClick={() => switchRole('doctor')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeRole === 'doctor'
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => switchRole('pharmacist')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeRole === 'pharmacist'
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Pharmacist
              </button>
              <button
                type="button"
                onClick={() => switchRole('nurse')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeRole === 'nurse'
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Nurse
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-900">{currentUser?.name || 'Staff User'}</div>
                <div className="text-[11px] text-slate-500">{currentUser?.department || 'Clinical Desk'}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs border border-slate-300">
                {(currentUser?.name || 'S').charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-100 py-1.5 overflow-x-auto">
          {navItems.map((item) => {
            const isRestricted = item.role && item.role !== activeRole;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => !isRestricted && setActiveTab(item.id)}
                disabled={isRestricted}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : isRestricted
                    ? 'text-slate-300 cursor-not-allowed opacity-60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={isRestricted ? `Only accessible to ${item.role}` : ''}
              >
                <span>{item.label}</span>
                {isRestricted && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
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
export default Navbar;
