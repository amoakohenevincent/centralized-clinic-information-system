import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SMSNotificationCenterModal } from '../common/SMSNotificationCenterModal';

export default function LandingNavbar({ onBookClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role, path) => {
    switchRole(role);
    setPortalDropdownOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
              MW
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                Medi<span className="text-teal-600">Well</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-teal-700 uppercase mt-0.5">
                Pharma & Clinic
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <a href="#home" className="text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors">
              Home
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors">
              About Us
            </a>
            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors">
              Our Services
            </a>
            <Link to="/prescriptions/catalogue" className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors">
              Products
            </Link>
            <a href="#news" className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors">
              Health Tips
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors">
              Contact Us
            </a>
          </nav>

          {/* Right Support + Action Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            {/* 24/7 Phone Support */}
            <div className="text-right leading-tight pr-1">
              <span className="block text-xs font-bold text-slate-900 tracking-tight">
                +233 30 212 3456
              </span>
              <span className="block text-[10px] font-semibold text-teal-700">
                24/7 Campus Clinic Desk
              </span>
            </div>

            {/* Book Appointment CTA */}
            <button
              onClick={onBookClick}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all"
            >
              Book Appointment
            </button>

            {/* Live External SMS Gateway Trigger */}
            <button
              onClick={() => setSmsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 transition-all shadow-xs"
              title="Open External SMS Gateway Delivery Receipts & Live Dispatcher"
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>SMS Alerts</span>
            </button>

            {/* Staff Portal Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Portal Access
              </button>

              {portalDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Switch Active Portal / Role
                  </div>
                  <button
                    onClick={() => handleRoleSelect('doctor', '/doctor/dashboard')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900"
                  >
                    <span className="font-bold block">Doctor Dashboard</span>
                    <span className="text-[10px] text-slate-500">Clinical consults & triage</span>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('pharmacist', '/prescriptions')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900"
                  >
                    <span className="font-bold block">Pharmacy & Dispensing</span>
                    <span className="text-[10px] text-slate-500">Rx fulfillment & stock</span>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('receptionist', '/reception/schedule')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900"
                  >
                    <span className="font-bold block">Reception Desk</span>
                    <span className="text-[10px] text-slate-500">Walk-ins & daily schedule</span>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('patient', '/patient/portal')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900"
                  >
                    <span className="font-bold block">Patient Portal</span>
                    <span className="text-[10px] text-slate-500">Self-booking & records</span>
                  </button>

                  <button
                    onClick={() => {
                      setPortalDropdownOpen(false);
                      setSmsModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-teal-800 hover:bg-teal-50 border-t border-slate-100"
                  >
                    <span className="font-bold block">SMS Gateway Logs</span>
                    <span className="text-[10px] text-slate-500">Live external delivery receipts</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-3 bg-white">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-teal-700">Home</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">About Us</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Our Services</a>
            <Link to="/prescriptions/catalogue" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Products & Medicine</Link>
            <a href="#news" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Health Tips</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Contact Us</a>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onBookClick(); }}
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm"
              >
                Book Appointment
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); setSmsModalOpen(true); }}
                className="w-full py-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-bold text-sm flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span>SMS Notification Center</span>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/doctor/dashboard'); }}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold text-sm"
              >
                Access Doctor & Staff Portals
              </button>
            </div>
          </div>
        )}
      </div>

      {/* External Service: SMS Notification Center Modal */}
      <SMSNotificationCenterModal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
      />
    </header>
  );
}
