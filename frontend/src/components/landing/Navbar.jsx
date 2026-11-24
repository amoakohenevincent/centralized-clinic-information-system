import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Menu, X, ChevronDown, User, Shield, Stethoscope, Pill, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LandingNavbar({ onBookClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const { currentUser, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role, path) => {
    switchRole(role);
    setPortalDropdownOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              {/* Medical Cross SVG */}
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                MediWell
              </span>
              <span className="text-[10px] font-bold tracking-widest text-teal-600 uppercase mt-0.5">
                PHARMA & CLINIC
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#home" className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
              Home
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
              About Us
            </a>
            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
              Our Services
            </a>
            <Link to="/prescriptions/catalogue" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
              Products
            </Link>
            <a href="#news" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
              Health Tips
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
              Contact Us
            </a>
          </nav>

          {/* Right Support + Action Buttons */}
          <div className="hidden sm:flex items-center gap-5">
            {/* 24/7 Phone Support */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-bold text-slate-900 tracking-tight">
                  +1 234 567 8900
                </span>
                <span className="block text-[10px] font-medium text-slate-500">
                  24/7 Support
                </span>
              </div>
            </div>

            {/* Book Appointment CTA (matches uploaded button) */}
            <button
              onClick={onBookClick}
              className="px-6 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm shadow-md shadow-teal-500/25 hover:shadow-lg hover:shadow-teal-500/30 transition-all cursor-pointer"
            >
              Book Appointment
            </button>

            {/* Staff Portal Dropdown (maintains user's information & dashboards) */}
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Clinic Staff Portals"
              >
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Portal Access</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {portalDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Portal / Role
                  </div>
                  <button
                    onClick={() => handleRoleSelect('doctor', '/doctor/dashboard')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    <div>
                      <span className="font-semibold block">Doctor Dashboard</span>
                      <span className="text-[10px] text-slate-400">Clinical consults & triage</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('pharmacist', '/prescriptions')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2"
                  >
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <div>
                      <span className="font-semibold block">Pharmacy & Dispensing</span>
                      <span className="text-[10px] text-slate-400">Rx fulfillment & stock</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('receptionist', '/reception/schedule')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <div>
                      <span className="font-semibold block">Reception Desk</span>
                      <span className="text-[10px] text-slate-400">Walk-ins & daily schedule</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('patient', '/patient/portal')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <div>
                      <span className="font-semibold block">Patient Portal</span>
                      <span className="text-[10px] text-slate-400">Self-booking & records</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-3 bg-white">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-teal-600">Home</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">About Us</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Our Services</a>
            <Link to="/prescriptions/catalogue" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Products & Medicine</Link>
            <a href="#news" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Health Tips</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700">Contact Us</a>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onBookClick(); }}
                className="w-full py-2.5 rounded-lg bg-teal-500 text-white font-semibold text-sm"
              >
                Book Appointment
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/doctor/dashboard'); }}
                className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-sm"
              >
                Access Doctor & Staff Portals
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

