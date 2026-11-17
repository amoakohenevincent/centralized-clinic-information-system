import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DoctorNavbar from './components/navigation/DoctorNavbar';

// 8 Required Clinical Frontend Pages
import DoctorDashboard from './pages/DoctorDashboard';
import AppointmentList from './pages/AppointmentList';
import PatientSearch from './pages/PatientSearch';
import PatientMedicalHistory from './pages/PatientMedicalHistory';
import ConsultationForm from './pages/ConsultationForm';
import DiagnosisForm from './pages/DiagnosisForm';
import ConsultationDetails from './pages/ConsultationDetails';
import ConsultationHistory from './pages/ConsultationHistory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <DoctorNavbar />
          <main className="flex-1 pb-16">
            <Routes>
              {/* Default Redirect to Doctor Dashboard */}
              <Route path="/" element={<Navigate to="/doctor/dashboard" replace />} />

              {/* 1. Doctor Dashboard */}
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

              {/* 2. Appointment List / Queue */}
              <Route path="/doctor/appointments" element={<AppointmentList />} />

              {/* 3. Patient Search */}
              <Route path="/doctor/patients" element={<PatientSearch />} />

              {/* 4. Patient Medical History */}
              <Route path="/doctor/patients/:patientId/history" element={<PatientMedicalHistory />} />

              {/* 5. Consultation Recording Form */}
              <Route path="/doctor/consultations/new/:appointmentId" element={<ConsultationForm />} />

              {/* 6. Diagnosis Recording Form */}
              <Route path="/doctor/diagnoses" element={<DiagnosisForm />} />

              {/* 7. Consultation Details */}
              <Route path="/doctor/consultations/:id" element={<ConsultationDetails />} />

              {/* 8. Consultation History Archive */}
              <Route path="/doctor/consultations/history" element={<ConsultationHistory />} />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

