import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
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
        <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
          <Activity className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Select an Active Consultation</h2>
        <p className="text-xs text-slate-500">
          To record or append diagnoses, select a consultation session from your waiting list or archive.
        </p>
        <Link
          to="/doctor/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold shadow-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          to={`/doctor/consultations/${consultationId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Consultation Details</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Diagnosis Coding & Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Record Diagnostic Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Patient: <strong className="text-slate-900">{consultation?.patientId?.fullName || consultation?.patientId?.firstName}</strong> • ID: <span className="font-mono text-teal-700">{consultation?.patientId?.patientId}</span>
          </p>
        </div>

        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-3.5 py-1.5 rounded-2xl border border-teal-200">
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
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>Existing Diagnoses on File ({consultation?.diagnoses?.length || 0})</span>
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
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Append New Diagnosis (Non-Destructive)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Safely append secondary, differential, or recurrence diagnoses to the patient profile.
          </p>
        </div>

        <form onSubmit={handleAddDiagnosis} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Diagnosis Description *
              </label>
              <input
                type="text"
                placeholder="e.g. Type 2 Diabetes Mellitus"
                value={diagnosisName}
                onChange={(e) => setDiagnosisName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ICD-10 Code
              </label>
              <input
                type="text"
                placeholder="E11.9"
                value={diagnosisCode}
                onChange={(e) => setDiagnosisCode(e.target.value)}
                className="w-full text-xs sm:text-sm font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Classification</label>
              <select
                value={diagnosisType}
                onChange={(e) => setDiagnosisType(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="differential">Differential</option>
                <option value="provisional">Provisional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
              <select
                value={clinicalStatus}
                onChange={(e) => setClinicalStatus(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              >
                <option value="active">Active</option>
                <option value="recurrence">Recurrence</option>
                <option value="resolved">Resolved</option>
                <option value="controlled">Controlled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Diagnostic Notes & Evidence
            </label>
            <textarea
              rows={2}
              placeholder="Clinical markers, laboratory confirmation, differential considerations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-xs hover:shadow transition-all"
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
