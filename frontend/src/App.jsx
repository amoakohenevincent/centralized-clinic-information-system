import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { PrescriptionDashboard } from './pages/PrescriptionDashboard';
import { CreatePrescription } from './pages/CreatePrescription';
import { MedicineSelectionView } from './pages/MedicineSelectionView';
import { PrescriptionDetails } from './pages/PrescriptionDetails';
import { PrescriptionHistory } from './pages/PrescriptionHistory';
import { PrescriptionStatusTracker } from './pages/PrescriptionStatusTracker';
import { PrescriptionHandoff } from './pages/PrescriptionHandoff';
import { prescriptionService } from './services/prescriptionService';

const CCISPrescriptionApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Auto-load an initial prescription so Details/Status views are immediately viewable
  useEffect(() => {
    prescriptionService.getPrescriptions().then((list) => {
      if (list && list.length > 0 && !selectedPrescription) {
        setSelectedPrescription(list[0]);
      }
    });
  }, []);

  const handleCreatedSuccess = (newRx) => {
    setSelectedPrescription(newRx);
    setActiveTab('handoff');
  };

  const handleSelectPrescription = (rx) => {
    setSelectedPrescription(rx);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar & Role Switcher */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Clinical Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <PrescriptionDashboard
            onNavigate={setActiveTab}
            onSelectPrescription={handleSelectPrescription}
          />
        )}

        {activeTab === 'create' && (
          <CreatePrescription
            onNavigate={setActiveTab}
            onCreatedSuccess={handleCreatedSuccess}
          />
        )}

        {activeTab === 'catalogue' && (
          <MedicineSelectionView
            onNavigate={setActiveTab}
            onSelectForPrescription={(med) => {
              // Pre-select medicine and navigate to create page
              setActiveTab('create');
            }}
          />
        )}

        {activeTab === 'details' && (
          <PrescriptionDetails
            prescription={selectedPrescription}
            onNavigate={setActiveTab}
            onUpdateSuccess={(updated) => setSelectedPrescription(updated)}
          />
        )}

        {activeTab === 'history' && (
          <PrescriptionHistory
            onNavigate={setActiveTab}
            onSelectPrescription={handleSelectPrescription}
          />
        )}

        {activeTab === 'status' && (
          <PrescriptionStatusTracker
            prescription={selectedPrescription}
            onNavigate={setActiveTab}
            onStatusUpdated={(updated) => setSelectedPrescription(updated)}
          />
        )}

        {activeTab === 'handoff' && (
          <PrescriptionHandoff
            prescription={selectedPrescription}
            onNavigate={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Centralized Clinic Information System (CCIS) • Prescription Management Module</span>
          </div>
          <div>
            Integration Status: Clinical Records (Connected) • Pharmacy Inventory (Madam Sarah - Connected)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CCISPrescriptionApp />
    </AuthProvider>
  );
}
