import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SMSNotificationCenterModal } from '../common/SMSNotificationCenterModal';

const DoctorNavbar = () => {
  const { currentUser, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);

  const role = currentUser?.role || 'doctor';

  const clinicalLinks = [
    { name: 'Dashboard', path: '/doctor/dashboard' },
    { name: 'Appointments', path: '/doctor/appointments' },
    { name: 'Patients', path: '/doctor/patients' },
    { name: 'Past Records', path: '/doctor/consultations/history' },
  ];

  const prescriptionLinks = [
    { name: 'Rx Dashboard', path: '/prescriptions' },
    { name: 'New Rx', path: '/prescriptions/create' },
    { name: 'Catalogue', path: '/prescriptions/catalogue' },
    { name: 'Rx History', path: '/prescriptions/history' },
  ];

  const receptionLinks = [
    { name: 'Schedule', path: '/reception/schedule' },
    { name: 'Walk-In Desk', path: '/reception/walk-in' },
  ];

  const patientLinks = [
    { name: 'Patient Portal', path: '/patient/portal' },
  ];

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
      isActive
        ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200 shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                MW
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                  Medi<span className="text-teal-600">Well</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 mt-0.5">
                  Clinical Suite
                </span>
              </div>
            </Link>

            {/* Back to Public Site */}
            <Link
              to="/"
              className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 transition-all border border-slate-200"
            >
              Public Site
            </Link>

            {/* Live External SMS Gateway Trigger */}
            <button
              onClick={() => setSmsModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100/70 border border-teal-200 transition-all"
              title="Open External SMS Gateway Delivery Receipts & Live Dispatcher"
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>SMS Alerts</span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
            {/* Clinical Section */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold px-2">
                Clinical
              </span>
              {clinicalLinks.map((item) => (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Prescriptions Section */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200 ml-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold px-2">
                Rx
              </span>
              {prescriptionLinks.map((item) => (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Reception & Patient Section */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200 ml-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold px-2">
                Desk
              </span>
              {receptionLinks.map((item) => (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  {item.name}
                </NavLink>
              ))}
              {patientLinks.map((item) => (
                <NavLink key={item.path} to={item.path} className={linkClass}>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Right: Role Switcher & Profile */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Role Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs">
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-500 px-1.5 hidden sm:inline">
                Role:
              </span>
              {['doctor', 'pharmacist', 'receptionist', 'patient'].map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                    role === r
                      ? 'bg-teal-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Profile Initials */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.firstName?.[0] || 'U'}
                {currentUser?.lastName?.[0] || ''}
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <span className="font-bold text-slate-900 block">
                  {currentUser?.title || ''} {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
                </span>
                <span className="text-[10px] text-teal-700 font-semibold block capitalize">
                  {role} · {currentUser?.specialization || 'Clinical Staff'}
                </span>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-slate-200 space-y-4 bg-white">
            <div className="px-2 pb-2 border-b border-slate-200 flex items-center justify-between">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Return to Public Website
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSmsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200"
              >
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span>SMS Gateway</span>
              </button>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2 mb-1.5">
                Doctor & Clinical Records
              </p>
              <div className="grid grid-cols-2 gap-1.5 px-2">
                {clinicalLinks.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={linkClass}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2 mb-1.5">
                Pharmacy & Dispensing
              </p>
              <div className="grid grid-cols-2 gap-1.5 px-2">
                {prescriptionLinks.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={linkClass}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2 mb-1.5">
                Reception & Patient Operations
              </p>
              <div className="grid grid-cols-2 gap-1.5 px-2">
                {receptionLinks.concat(patientLinks).map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={linkClass}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* External Service: Live SMS Notification Center Modal */}
      <SMSNotificationCenterModal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />
    </header>
  );
};

export default DoctorNavbar;
