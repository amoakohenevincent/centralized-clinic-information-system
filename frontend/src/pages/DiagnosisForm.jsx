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
        <h2 className="font-serif text-2xl font-normal text-[#191919]">Select an Active Consultation</h2>
        <p className="text-xs text-[#787774]">
          To record or append diagnoses, select a consultation session from your queue or archive.
        </p>
        <Link
          to="/doctor/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#191919] hover:bg-[#333333] text-white rounded-none text-xs font-medium"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={`/doctor/consultations/${consultationId}`}
          className="text-xs font-medium text-[#787774] hover:text-[#191919] flex items-center gap-1 transition-colors"
        >
          ← Back to Consultation Details
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#191919] tracking-tight">
            Record Diagnostic Assessment
          </h1>
          <span className="font-mono text-xs text-[#191919] bg-[#ebebeb] px-2 py-0.5 rounded-none">
            {consultation?.consultationNumber}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#787774]">
          Patient: <strong className="text-[#191919]">{consultation?.patientId?.fullName || consultation?.patientId?.firstName}</strong> • ID: <span className="font-mono text-[#191919]">{consultation?.patientId?.patientId}</span>
        </p>
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
      <div className="bg-white p-6 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-3">
        <h3 className="font-serif font-bold text-base text-[#191919]">
          Previously Recorded Diagnoses ({consultation?.diagnoses?.length || 0})
        </h3>

        {consultation?.diagnoses?.length === 0 ? (
          <p className="text-xs text-[#9b9a97]">No diagnoses recorded yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {consultation?.diagnoses?.map((d, i) => (
              <DiagnosisBadge key={i} diagnosis={d} />
            ))}
          </div>
        )}
      </div>

      {/* Append New Diagnosis */}
      <div className="bg-white p-6 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-5">
        <div className="border-b border-[#f1f1ef] pb-3">
          <h3 className="font-serif font-bold text-base text-[#191919]">
            Append New Diagnosis (Non-Destructive)
          </h3>
          <p className="text-xs text-[#787774]">
            Safely record secondary, differential, or recurrence diagnoses to the patient profile.
          </p>
        </div>

        <form onSubmit={handleAddDiagnosis} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Diagnosis Description *
              </label>
              <input
                type="text"
                placeholder="e.g. Type 2 Diabetes Mellitus"
                value={diagnosisName}
                onChange={(e) => setDiagnosisName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                ICD-10 Code
              </label>
              <input
                type="text"
                placeholder="E11.9"
                value={diagnosisCode}
                onChange={(e) => setDiagnosisCode(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">Classification</label>
              <select
                value={diagnosisType}
                onChange={(e) => setDiagnosisType(e.target.value)}
                className="w-full text-xs px-2 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="differential">Differential</option>
                <option value="provisional">Provisional</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full text-xs px-2 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">Status</label>
              <select
                value={clinicalStatus}
                onChange={(e) => setClinicalStatus(e.target.value)}
                className="w-full text-xs px-2 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
              >
                <option value="active">Active</option>
                <option value="recurrence">Recurrence</option>
                <option value="resolved">Resolved</option>
                <option value="controlled">Controlled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#787774] mb-1">
              Diagnostic Notes & Evidence
            </label>
            <textarea
              rows={2}
              placeholder="Clinical markers, laboratory confirmation, differential considerations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#191919] hover:bg-[#333333] text-white font-medium text-xs rounded-none shadow-notion-button transition-colors"
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
