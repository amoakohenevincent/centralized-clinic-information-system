import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Search,
  History,
  Pill,
  FilePlus2,
  BookOpen,
  ClipboardList,
  UserCheck,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorNavbar = () => {
  const { currentUser, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = currentUser?.role || 'doctor';

  // Navigation sections categorized by capability
  const clinicalLinks = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { name: 'Patients', path: '/doctor/patients', icon: Search },
    { name: 'Past Records', path: '/doctor/consultations/history', icon: History },
  ];

  const prescriptionLinks = [
    { name: 'Rx Dashboard', path: '/prescriptions', icon: Pill },
    { name: 'New Rx', path: '/prescriptions/create', icon: FilePlus2 },
    { name: 'Catalogue', path: '/prescriptions/catalogue', icon: BookOpen },
    { name: 'Rx History', path: '/prescriptions/history', icon: ClipboardList },
  ];

  const receptionLinks = [
    { name: 'Daily Schedule', path: '/reception/schedule', icon: Calendar },
    { name: 'Walk-in Desk', path: '/reception/walk-in', icon: UserCheck },
  ];

  const patientLinks = [
    { name: 'Patient Portal', path: '/patient/portal', icon: User },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
      isActive
        ? 'bg-[#efefee] text-[#191919] font-bold border-b-2 border-[#191919]'
        : 'text-[#5a5a5a] hover:text-[#191919] hover:bg-[#f1f1ef]'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#fbfbfa]/95 backdrop-blur-md border-b border-[#e9e9e7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <NavLink to="/doctor/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-[#191919] text-white flex items-center justify-center font-serif font-black text-base shadow-sm">
              CC
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#191919]">
                CCIS
              </span>
              <span className="hidden sm:inline-block text-[10px] font-medium text-[#787774] px-1.5 py-0.5 bg-[#ebebeb]">
                Centralized Clinic
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links grouped by Module */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {/* Clinical Section */}
            <div className="flex items-center gap-0.5 border-r border-[#e9e9e7] pr-2 mr-2">
              <span className="text-[9px] uppercase tracking-wider text-[#9b9a97] font-bold px-1">
                Clinical
              </span>
              {clinicalLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Prescriptions Section */}
            <div className="flex items-center gap-0.5 border-r border-[#e9e9e7] pr-2 mr-2">
              <span className="text-[9px] uppercase tracking-wider text-[#9b9a97] font-bold px-1">
                Rx
              </span>
              {prescriptionLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Reception & Patient Section */}
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] uppercase tracking-wider text-[#9b9a97] font-bold px-1">
                Ops
              </span>
              {receptionLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
              {patientLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <Icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Right: Role Switcher & Profile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Role Switcher */}
            <div className="flex items-center gap-0.5 bg-[#efefee] p-1 border border-[#e5e5e3] text-xs">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#787774] px-1 hidden sm:inline">
                Role:
              </span>
              {['doctor', 'pharmacist', 'receptionist', 'patient', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-1.5 py-0.5 text-[10px] font-medium capitalize transition-colors ${
                    role === r ? 'bg-[#191919] text-white font-bold' : 'text-[#5a5a5a] hover:text-[#191919]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#e9e9e7]">
              <div className="w-8 h-8 bg-[#f1f1ef] text-[#191919] flex items-center justify-center font-bold text-xs border border-[#e5e5e3]">
                {currentUser?.firstName?.[0] || 'U'}
                {currentUser?.lastName?.[0] || ''}
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <span className="font-semibold text-[#191919] block">
                  {currentUser?.title || ''} {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
                </span>
                <span className="text-[10px] text-[#787774] block capitalize">
                  {role} · {currentUser?.specialization || 'Clinical'}
                </span>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#5a5a5a] hover:text-[#191919]"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-[#e9e9e7] space-y-3 bg-[#fbfbfa]">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[#787774] font-bold px-2 mb-1">Clinical Records</p>
              <div className="grid grid-cols-2 gap-1 px-2">
                {clinicalLinks.map((item) => (
                  <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={linkClass}>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-wider text-[#787774] font-bold px-2 mb-1">Prescriptions & Pharmacy</p>
              <div className="grid grid-cols-2 gap-1 px-2">
                {prescriptionLinks.map((item) => (
                  <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={linkClass}>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-wider text-[#787774] font-bold px-2 mb-1">Reception & Patient</p>
              <div className="grid grid-cols-2 gap-1 px-2">
                {receptionLinks.concat(patientLinks).map((item) => (
                  <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={linkClass}>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DoctorNavbar;
