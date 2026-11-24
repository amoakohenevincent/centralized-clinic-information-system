import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DoctorNavbar from './components/navigation/DoctorNavbar';

// ─── Public Landing Page (Matches Uploaded UI) ───
import LandingPage from './pages/LandingPage';

// ─── Module 2: Clinical Records Pages (Your Foundation) ───
import DoctorDashboard from './pages/DoctorDashboard';
import AppointmentList from './pages/AppointmentList';
import PatientSearch from './pages/PatientSearch';
import PatientMedicalHistory from './pages/PatientMedicalHistory';
import ConsultationForm from './pages/ConsultationForm';
import DiagnosisForm from './pages/DiagnosisForm';
import ConsultationDetails from './pages/ConsultationDetails';
import ConsultationHistory from './pages/ConsultationHistory';

// ─── Module 3: Prescription Management Pages (Team Module) ───
import { PrescriptionDashboard } from './pages/PrescriptionDashboard';
import { CreatePrescription } from './pages/CreatePrescription';
import { MedicineSelectionView } from './pages/MedicineSelectionView';
import { PrescriptionDetails } from './pages/PrescriptionDetails';
import { PrescriptionHistory } from './pages/PrescriptionHistory';
import { PrescriptionStatusTracker } from './pages/PrescriptionStatusTracker';
import { PrescriptionHandoff } from './pages/PrescriptionHandoff';

// ─── Module 1: Patient & Appointment Pages (Team Module) ───
import DailySchedule from './pages/DailySchedule';
import WalkInRegistration from './pages/WalkInRegistration';
import PatientPortal from './pages/PatientPortal';

// ─── Clinical Staff Layout Wrapper ───
function ClinicalLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <DoctorNavbar />
      <main className="flex-1 pb-16">{children}</main>
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="font-semibold text-slate-700">MediWell Centralized Clinic Information System (CCIS)</span>
          </div>
          <div className="text-[11px]">
            Module 1: Patients & Appointments · Module 2: Clinical Records · Module 3: Prescriptions · Module 4: Pharmacy
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Prescription Module Sub-Router Wrapper ───
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

// ─── Main CCIS Application ───
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page (Matches exact MediWell UI from uploaded design) */}
          <Route path="/" element={<LandingPage />} />

          {/* Module 2: Clinical Records (Your Foundation) */}
          <Route path="/doctor/dashboard" element={<ClinicalLayout><DoctorDashboard /></ClinicalLayout>} />
          <Route path="/doctor/appointments" element={<ClinicalLayout><AppointmentList /></ClinicalLayout>} />
          <Route path="/doctor/patients" element={<ClinicalLayout><PatientSearch /></ClinicalLayout>} />
          <Route path="/doctor/patients/:patientId/history" element={<ClinicalLayout><PatientMedicalHistory /></ClinicalLayout>} />
          <Route path="/doctor/consultations/new/:appointmentId" element={<ClinicalLayout><ConsultationForm /></ClinicalLayout>} />
          <Route path="/doctor/diagnoses" element={<ClinicalLayout><DiagnosisForm /></ClinicalLayout>} />
          <Route path="/doctor/consultations/:id" element={<ClinicalLayout><ConsultationDetails /></ClinicalLayout>} />
          <Route path="/doctor/consultations/history" element={<ClinicalLayout><ConsultationHistory /></ClinicalLayout>} />

          {/* Module 3: Prescription Management */}
          <Route path="/prescriptions/*" element={<ClinicalLayout><PrescriptionModule /></ClinicalLayout>} />

          {/* Module 1: Patient & Appointment Operations */}
          <Route path="/reception/schedule" element={<ClinicalLayout><DailySchedule /></ClinicalLayout>} />
          <Route path="/reception/walk-in" element={<ClinicalLayout><WalkInRegistration /></ClinicalLayout>} />
          <Route path="/patient/portal" element={<ClinicalLayout><PatientPortal /></ClinicalLayout>} />

          {/* Catch-all redirects to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
