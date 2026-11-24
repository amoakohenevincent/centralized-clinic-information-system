import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { clinicalService } from '../services/clinicalService';
import { useAuth } from '../context/AuthContext';
import DiagnosisBadge from '../components/clinical/DiagnosisBadge';
import AlertBanner from '../components/common/AlertBanner';
import Badge from '../components/common/Badge';

const DiagnosisForm = () => {
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get('consultationId');
  const navigate = useNavigate();
  const { currentUser, isDoctor } = useAuth();

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [diagnosisName, setDiagnosisName] = useState('');
  const [diagnosisCode, setDiagnosisCode] = useState('');
  const [diagnosisType, setDiagnosisType] = useState('secondary');
  const [severity, setSeverity] = useState('moderate');
  const [clinicalStatus, setClinicalStatus] = useState('active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchConsultation = async () => {
      if (!consultationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await clinicalService.getConsultationById(consultationId);
        setConsultation(data);
      } catch (err) {
        setError(err.message || 'Could not load consultation.');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [consultationId]);

  const handleAddDiagnosis = async (e) => {
    e.preventDefault();
    if (!diagnosisName.trim()) {
      setError('Diagnosis name is mandatory.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        diagnosisName: diagnosisName.trim(),
        diagnosisCode: diagnosisCode.trim(),
        diagnosisType,
        severity,
        clinicalStatus,
        notes: notes.trim(),
      };

      const updated = await clinicalService.recordDiagnosis(consultationId, payload);
      setConsultation(updated);
      setSuccess(true);
      setDiagnosisName('');
      setDiagnosisCode('');
      setNotes('');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to append diagnosis.');
    } finally {
      setSaving(false);
    }
  };

  if (!consultationId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Select an Active Consultation</h2>
        <p className="text-xs text-slate-500">
          To record or append diagnoses, select a consultation session from your waiting list or archive.
        </p>
        <Link
          to="/doctor/dashboard"
          className="inline-block px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={`/doctor/consultations/${consultationId}`}
          className="text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors"
        >
          ← Back to Consultation Details
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block mb-1">
            Diagnosis Coding & Assessment
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Record Diagnostic Assessment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Patient: <strong className="text-slate-900">{consultation?.patientId?.fullName || consultation?.patientId?.firstName}</strong> • ID: <span className="font-mono text-teal-800">{consultation?.patientId?.patientId}</span>
          </p>
        </div>

        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
          {consultation?.consultationNumber}
        </span>
      </div>

      {error && <AlertBanner type="danger" message={error} />}
      {success && (
        <AlertBanner
          type="success"
          title="Diagnosis Appended Successfully"
          message="Appended to patient clinical record and audit log without overwriting history."
        />
      )}

      {/* Previously Recorded Diagnoses */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          Existing Diagnoses on File ({consultation?.diagnoses?.length || 0})
        </h3>

        {consultation?.diagnoses?.length === 0 ? (
          <p className="text-xs text-slate-400">No diagnoses recorded yet for this encounter.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {consultation?.diagnoses?.map((d, i) => (
              <DiagnosisBadge key={i} diagnosis={d} />
            ))}
          </div>
        )}
      </div>

      {/* Append New Diagnosis */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Append New Diagnosis (Non-Destructive)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Safely append secondary, differential, or recurrence diagnoses to the patient profile.
          </p>
        </div>

        <form onSubmit={handleAddDiagnosis} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Diagnosis Description *
              </label>
              <input
                type="text"
                placeholder="e.g. Type 2 Diabetes Mellitus"
                value={diagnosisName}
                onChange={(e) => setDiagnosisName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ICD-10 Code
              </label>
              <input
                type="text"
                placeholder="E11.9"
                value={diagnosisCode}
                onChange={(e) => setDiagnosisCode(e.target.value)}
                className="w-full text-xs sm:text-sm font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Classification</label>
              <select
                value={diagnosisType}
                onChange={(e) => setDiagnosisType(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="differential">Differential</option>
                <option value="provisional">Provisional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={clinicalStatus}
                onChange={(e) => setClinicalStatus(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="active">Active</option>
                <option value="recurrence">Recurrence</option>
                <option value="resolved">Resolved</option>
                <option value="controlled">Controlled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Diagnostic Notes & Evidence
            </label>
            <textarea
              rows={2}
              placeholder="Clinical markers, laboratory confirmation, differential considerations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              {saving ? 'Appending...' : 'Save Diagnosis to Consultation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiagnosisForm;
