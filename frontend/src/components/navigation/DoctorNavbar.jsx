import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Stethoscope,
  LayoutDashboard,
  Calendar,
  Search,
  History,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorNavbar = () => {
  const { currentUser, switchRole, isDoctor } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Find Patients', path: '/doctor/patients', icon: Search },
    { name: 'Past Records', path: '/doctor/consultations/history', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fbfbfa]/95 backdrop-blur-md border-b border-[#e9e9e7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand: Square Minimal Style */}
          <div className="flex items-center gap-2.5 flex-shrink-0 whitespace-nowrap">
            <div className="w-8 h-8 rounded-none bg-[#191919] text-white flex items-center justify-center font-serif font-black text-base shadow-sm flex-shrink-0">
              U
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#191919] whitespace-nowrap">
                University Clinic
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-[#787774] px-1.5 py-0.5 rounded-none bg-[#ebebeb] whitespace-nowrap">
                Medical Records
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links: Straight Single Line */}
          <nav className="hidden md:flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-[#efefee] text-[#191919] font-bold border-b-2 border-[#191919]'
                        : 'text-[#5a5a5a] hover:text-[#191919] hover:bg-[#f1f1ef]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right: RBAC switcher & profile */}
          <div className="flex items-center gap-3 flex-shrink-0 whitespace-nowrap">
            {/* Square Role Switcher */}
            <div className="flex items-center gap-1 bg-[#efefee] p-1 rounded-none border border-[#e5e5e3] text-xs whitespace-nowrap">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#787774] px-1.5 whitespace-nowrap">
                Role:
              </span>
              <button
                onClick={() => switchRole('doctor')}
                className={`px-2 py-0.5 rounded-none text-[11px] font-medium whitespace-nowrap transition-colors ${
                  currentUser.role === 'doctor'
                    ? 'bg-[#191919] text-white'
                    : 'text-[#5a5a5a] hover:text-[#191919]'
                }`}
              >
                Doctor
              </button>
              <button
                onClick={() => switchRole('nurse')}
                className={`px-2 py-0.5 rounded-none text-[11px] font-medium whitespace-nowrap transition-colors ${
                  currentUser.role === 'nurse'
                    ? 'bg-[#191919] text-white'
                    : 'text-[#5a5a5a] hover:text-[#191919]'
                }`}
              >
                Nurse
              </button>
              <button
                onClick={() => switchRole('admin')}
                className={`px-2 py-0.5 rounded-none text-[11px] font-medium whitespace-nowrap transition-colors ${
                  currentUser.role === 'admin'
                    ? 'bg-[#191919] text-white'
                    : 'text-[#5a5a5a] hover:text-[#191919]'
                }`}
              >
                Admin
              </button>
            </div>

            {/* User Profile Monogram Avatar (Square) */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#e9e9e7] flex-shrink-0 whitespace-nowrap">
              <div className="w-8 h-8 rounded-none bg-[#f1f1ef] text-[#191919] flex items-center justify-center font-bold text-xs border border-[#e5e5e3] flex-shrink-0">
                {currentUser.firstName?.[0]}
                {currentUser.lastName?.[0]}
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight whitespace-nowrap">
                <span className="font-semibold text-[#191919] block whitespace-nowrap">
                  {currentUser.title || 'Dr.'} {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="text-[10px] text-[#787774] block whitespace-nowrap">
                  {currentUser.specialization || 'Internal Medicine'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorNavbar;
