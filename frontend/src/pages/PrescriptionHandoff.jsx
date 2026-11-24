import React from 'react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const PrescriptionHandoff = ({ prescription, onNavigate }) => {
  if (!prescription) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="text-slate-500 text-sm">No prescription available for handoff view.</div>
        <Button size="sm" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8 px-4 animate-fadeIn">
      {/* Success Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Handoff Confirmed & Transmitted
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">
            Prescription Sent to Pharmacy
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            The prescription record has been registered in the central CCIS database and is now available in Madam Sarah's Pharmacy queue for dispensing.
          </p>
        </div>

        {/* Handoff Receipt Details */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left text-xs space-y-2.5 max-w-md mx-auto">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500">Prescription Tracking ID:</span>
            <span className="font-mono font-bold text-teal-800 text-sm">
              {prescription.prescriptionNumber}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Patient:</span>
            <span className="font-semibold text-slate-900">
              {prescription.patientName} ({prescription.patientIdentifier})
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Prescribed By:</span>
            <span className="font-medium text-slate-800">{prescription.doctorName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Transmission Timestamp:</span>
            <span className="text-slate-700">
              {new Date(prescription.createdAt || Date.now()).toLocaleTimeString()} (
              {new Date(prescription.createdAt || Date.now()).toLocaleDateString()})
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Initial Dispensing Status:</span>
            <Badge status={prescription.status || 'pending'} size="sm" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-slate-500">Medications Ordered:</span>
            <span className="font-bold text-slate-900">{prescription.items?.length || 0} line items</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="md"
            onClick={() => onNavigate('dashboard')}
          >
            Return to Dashboard
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => onNavigate('details')}
          >
            View / Print Prescription
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('create')}
          >
            + Create Another Prescription
          </Button>
        </div>
      </div>
    </div>
  );
};
