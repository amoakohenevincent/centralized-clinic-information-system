import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DoctorNavbar from './components/navigation/DoctorNavbar';

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
        <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans text-[#191919]">
          <DoctorNavbar />
          <main className="flex-1 pb-16">
            <Routes>
              {/* Default Redirect to Doctor Dashboard */}
              <Route path="/" element={<Navigate to="/doctor/dashboard" replace />} />

              {/* Module 2: Clinical Records (Foundation) */}
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

              {/* Module 1: Patient & Appointment Operations */}
              <Route path="/reception/schedule" element={<DailySchedule />} />
              <Route path="/reception/walk-in" element={<WalkInRegistration />} />
              <Route path="/patient/portal" element={<PatientPortal />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
            </Routes>
          </main>

          {/* Unified Footer */}
          <footer className="bg-white border-t border-[#e9e9e7] py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#787774] gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#2b784c]" />
                <span className="font-semibold text-[#191919]">Centralized Clinic Information System (CCIS)</span>
              </div>
              <div className="text-[11px]">
                Module 1: Patients & Appointments · Module 2: Clinical Records · Module 3: Prescriptions · Module 4: Pharmacy
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
