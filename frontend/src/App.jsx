import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ─── Module 2: Clinical Records Pages (Your Code) ───
import DoctorDashboard from './pages/DoctorDashboard';
import AppointmentList from './pages/AppointmentList';
import PatientSearch from './pages/PatientSearch';
import PatientMedicalHistory from './pages/PatientMedicalHistory';
import ConsultationForm from './pages/ConsultationForm';
import DiagnosisForm from './pages/DiagnosisForm';
import ConsultationDetails from './pages/ConsultationDetails';
import ConsultationHistory from './pages/ConsultationHistory';

// ─── Module 3: Prescription Management Pages (Team Member's Code) ───
import { PrescriptionDashboard } from './pages/PrescriptionDashboard';
import { CreatePrescription } from './pages/CreatePrescription';
import { MedicineSelectionView } from './pages/MedicineSelectionView';
import { PrescriptionDetails } from './pages/PrescriptionDetails';
import { PrescriptionHistory } from './pages/PrescriptionHistory';
import { PrescriptionStatusTracker } from './pages/PrescriptionStatusTracker';
import { PrescriptionHandoff } from './pages/PrescriptionHandoff';

// ─── Unified Navigation Bar ───
function UnifiedNavbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/doctor/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              CC
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">CCIS</p>
              <p className="text-[10px] text-slate-500 leading-tight">Centralized Clinic IS</p>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Module 2: Clinical */}
            <div className="flex items-center gap-1 border-r border-slate-200 pr-3 mr-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mr-1">Clinical</span>
              <NavLink to="/doctor/dashboard" className={navLinkClasses}>Dashboard</NavLink>
              <NavLink to="/doctor/appointments" className={navLinkClasses}>Queue</NavLink>
              <NavLink to="/doctor/patients" className={navLinkClasses}>Patients</NavLink>
              <NavLink to="/doctor/consultations/history" className={navLinkClasses}>History</NavLink>
            </div>

            {/* Module 3: Prescriptions */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mr-1">Rx</span>
              <NavLink to="/prescriptions" className={navLinkClasses}>Rx Dashboard</NavLink>
              <NavLink to="/prescriptions/create" className={navLinkClasses}>New Rx</NavLink>
              <NavLink to="/prescriptions/history" className={navLinkClasses}>Rx History</NavLink>
              <NavLink to="/prescriptions/catalogue" className={navLinkClasses}>Catalogue</NavLink>
            </div>
          </nav>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-700">
                {user?.title || 'Dr.'} {user?.firstName || 'User'} {user?.lastName || ''}
              </p>
              <p className="text-[11px] text-slate-500 capitalize">{user?.role || 'doctor'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
              {(user?.firstName?.[0] || 'U')}{(user?.lastName?.[0] || '')}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-slate-500 hover:text-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-3 pt-2">Clinical Records</p>
            <NavLink to="/doctor/dashboard" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
            <NavLink to="/doctor/appointments" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Queue</NavLink>
            <NavLink to="/doctor/patients" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Patients</NavLink>
            <NavLink to="/doctor/consultations/history" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>History</NavLink>

            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-3 pt-3">Prescriptions</p>
            <NavLink to="/prescriptions" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Rx Dashboard</NavLink>
            <NavLink to="/prescriptions/create" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>New Rx</NavLink>
            <NavLink to="/prescriptions/history" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Rx History</NavLink>
            <NavLink to="/prescriptions/catalogue" className={navLinkClasses} onClick={() => setMobileMenuOpen(false)}>Catalogue</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}

// ─── Prescription Module Wrapper (tab-based pages need adapter) ───
function PrescriptionModule() {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const navigate = useNavigate();

  const handleNavigate = (tab) => {
    const routeMap = {
      dashboard: '/prescriptions',
      create: '/prescriptions/create',
      catalogue: '/prescriptions/catalogue',
      details: '/prescriptions/details',
      history: '/prescriptions/history',
      status: '/prescriptions/status',
      handoff: '/prescriptions/handoff',
    };
    navigate(routeMap[tab] || '/prescriptions');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrescriptionDashboard
            onNavigate={handleNavigate}
            onSelectPrescription={setSelectedPrescription}
          />
        }
      />
      <Route
        path="/create"
        element={
          <CreatePrescription
            onNavigate={handleNavigate}
            onCreatedSuccess={(rx) => {
              setSelectedPrescription(rx);
              handleNavigate('handoff');
            }}
          />
        }
      />
      <Route
        path="/catalogue"
        element={
          <MedicineSelectionView
            onNavigate={handleNavigate}
            onSelectForPrescription={() => handleNavigate('create')}
          />
        }
      />
      <Route
        path="/details"
        element={
          <PrescriptionDetails
            prescription={selectedPrescription}
            onNavigate={handleNavigate}
            onUpdateSuccess={setSelectedPrescription}
          />
        }
      />
      <Route
        path="/history"
        element={
          <PrescriptionHistory
            onNavigate={handleNavigate}
            onSelectPrescription={setSelectedPrescription}
          />
        }
      />
      <Route
        path="/status"
        element={
          <PrescriptionStatusTracker
            prescription={selectedPrescription}
            onNavigate={handleNavigate}
            onStatusUpdated={setSelectedPrescription}
          />
        }
      />
      <Route
        path="/handoff"
        element={
          <PrescriptionHandoff
            prescription={selectedPrescription}
            onNavigate={handleNavigate}
          />
        }
      />
    </Routes>
  );
}

// ─── Main App ───
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <UnifiedNavbar />
          <main className="flex-1 pb-16">
            <Routes>
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/doctor/dashboard" replace />} />

              {/* Module 2: Clinical Records */}
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<AppointmentList />} />
              <Route path="/doctor/patients" element={<PatientSearch />} />
              <Route path="/doctor/patients/:patientId/history" element={<PatientMedicalHistory />} />
              <Route path="/doctor/consultations/new/:appointmentId" element={<ConsultationForm />} />
              <Route path="/doctor/diagnoses" element={<DiagnosisForm />} />
              <Route path="/doctor/consultations/:id" element={<ConsultationDetails />} />
              <Route path="/doctor/consultations/history" element={<ConsultationHistory />} />

              {/* Module 3: Prescription Management */}
              <Route path="/prescriptions/*" element={<PrescriptionModule />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
            </Routes>
          </main>

          {/* Unified Footer */}
          <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Centralized Clinic Information System (CCIS)</span>
              </div>
              <div>
                Module 1: Patients & Appointments · Module 2: Clinical Records · Module 3: Prescriptions
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
