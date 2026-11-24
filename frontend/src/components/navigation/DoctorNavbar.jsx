import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorNavbar = () => {
  const { currentUser, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = currentUser?.role || 'doctor';

  // Navigation sections categorized by module
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
    { name: 'Schedule', path: '/reception/schedule', icon: Calendar },
    { name: 'Walk-In Desk', path: '/reception/walk-in', icon: UserCheck },
  ];

  const patientLinks = [
    { name: 'Patient Portal', path: '/patient/portal', icon: User },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
      isActive
        ? 'bg-teal-50 text-teal-700 font-bold border border-teal-200/80 shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-sm group-hover:bg-teal-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                  Medi<span className="text-teal-600">Well</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 mt-0.5">
                  Clinical Suite
                </span>
              </div>
            </Link>

            {/* Back to Public Site Pill */}
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-500 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 transition-all border border-slate-200/60"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Public Site</span>
            </Link>
          </div>

          {/* Desktop Navigation Links grouped by Module */}
          <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
            {/* Clinical Section */}
            <div className="flex items-center gap-0.5 bg-slate-50/70 p-1 rounded-2xl border border-slate-100">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold px-2">
                Clinical
              </span>
              {clinicalLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Prescriptions Section */}
            <div className="flex items-center gap-0.5 bg-slate-50/70 p-1 rounded-2xl border border-slate-100 ml-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold px-2">
                Rx
              </span>
              {prescriptionLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Reception & Patient Section */}
            <div className="flex items-center gap-0.5 bg-slate-50/70 p-1 rounded-2xl border border-slate-100 ml-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold px-2">
                Ops
              </span>
              {receptionLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
              {patientLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={linkClass}>
                    <Icon className="w-3.5 h-3.5 opacity-80" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Right: Role Switcher & Profile */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Role Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/80 text-xs">
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500 px-1.5 hidden sm:inline">
                Role:
              </span>
              {['doctor', 'pharmacist', 'receptionist', 'patient'].map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full capitalize transition-all ${
                    role === r
                      ? 'bg-teal-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.firstName?.[0] || 'U'}
                {currentUser?.lastName?.[0] || ''}
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <span className="font-bold text-slate-900 block">
                  {currentUser?.title || ''} {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
                </span>
                <span className="text-[10px] text-teal-600 font-semibold block capitalize">
                  {role} · {currentUser?.specialization || 'Clinical Staff'}
                </span>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-slate-100 space-y-4 bg-white animate-fadeIn">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Website
              </Link>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 mb-1.5">Doctor & Clinical Records</p>
              <div className="grid grid-cols-2 gap-1.5 px-2">
                {clinicalLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={linkClass}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 mb-1.5">Pharmacy & Dispensing</p>
              <div className="grid grid-cols-2 gap-1.5 px-2">
                {prescriptionLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={linkClass}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 mb-1.5">Reception & Patient Operations</p>
              <div className="grid grid-cols-2 gap-1.5 px-2">
                {receptionLinks.concat(patientLinks).map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={linkClass}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DoctorNavbar;

