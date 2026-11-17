import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { clinicalService } from '../services/clinicalService';
import { useAuth } from '../context/AuthContext';
import VitalSignsInput from '../components/clinical/VitalSignsInput';
import AlertBanner from '../components/common/AlertBanner';
import Badge from '../components/common/Badge';

const ConsultationForm = () => {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const patientIdFromQuery = searchParams.get('patientId');
  const navigate = useNavigate();
  const { currentUser, isDoctor } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [formData, setFormData] = useState({
    patientId: patientIdFromQuery || '',
    appointmentId: appointmentId || '',
    consultationDate: new Date().toISOString().split('T')[0],
    vitalSigns: {
      bloodPressure: '120/80',
      heartRate: 76,
      temperature: 37.0,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 70,
      height: 175,
      bmi: 22.9,
    },
    presentingComplaints: [{ complaint: '', duration: '', severity: 'moderate' }],
    symptomsText: '',
    clinicalObservations: '',
    diagnoses: [
      {
        diagnosisName: '',
        diagnosisCode: '',
        diagnosisType: 'primary',
        severity: 'moderate',
        notes: '',
      },
    ],
    doctorNotes: '',
    followUpRequired: false,
    followUpDate: '',
    followUpInstructions: '',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (patientIdFromQuery) {
        try {
          const data = await clinicalService.getPatientMedicalHistory(patientIdFromQuery);
          setPatient(data.patient);
          setFormData((prev) => ({ ...prev, patientId: patientIdFromQuery }));
        } catch (err) {
          console.warn('Could not load patient header for consultation form.');
        } finally {
          setLoadingPatient(false);
        }
      } else {
        setLoadingPatient(false);
      }
    };

    fetchPatientData();
  }, [patientIdFromQuery]);

  const addComplaint = () => {
    setFormData((prev) => ({
      ...prev,
      presentingComplaints: [
        ...prev.presentingComplaints,
        { complaint: '', duration: '', severity: 'moderate' },
      ],
    }));
  };

  const removeComplaint = (idx) => {
    setFormData((prev) => ({
      ...prev,
      presentingComplaints: prev.presentingComplaints.filter((_, i) => i !== idx),
    }));
  };

  const handleComplaintChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.presentingComplaints];
      updated[idx][field] = value;
      return { ...prev, presentingComplaints: updated };
    });
  };

  const addDiagnosis = () => {
    setFormData((prev) => ({
      ...prev,
      diagnoses: [
        ...prev.diagnoses,
        {
          diagnosisName: '',
          diagnosisCode: '',
          diagnosisType: 'secondary',
          severity: 'moderate',
          notes: '',
        },
      ],
    }));
  };

  const removeDiagnosis = (idx) => {
    if (formData.diagnoses.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      diagnoses: prev.diagnoses.filter((_, i) => i !== idx),
    }));
  };

  const handleDiagnosisChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.diagnoses];
      updated[idx][field] = value;
      return { ...prev, diagnoses: updated };
    });
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.clinicalObservations.trim()) {
      errs.clinicalObservations = 'Clinical observations and findings are required.';
    } else if (formData.clinicalObservations.trim().length < 5) {
      errs.clinicalObservations = 'Clinical observations must be at least 5 characters.';
    }

    const validDiagnoses = formData.diagnoses.filter((d) => d.diagnosisName.trim().length > 0);
    if (validDiagnoses.length === 0) {
      errs.diagnoses = 'At least one primary diagnosis is required before finalizing a consultation.';
    }

    if (!formData.patientId) {
      errs.patientId = 'Patient ID is missing.';
    }
    if (!formData.appointmentId) {
      errs.appointmentId = 'Appointment ID is missing.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const symptomsArray = formData.symptomsText
        ? formData.symptomsText
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [];

      const complaintsArray = formData.presentingComplaints.filter((c) => c.complaint.trim().length > 0);

      const payload = {
        patientId: formData.patientId,
        appointmentId: formData.appointmentId,
        consultationDate: formData.consultationDate,
        vitalSigns: formData.vitalSigns,
        presentingComplaints: complaintsArray,
        symptoms: symptomsArray,
        clinicalObservations: formData.clinicalObservations,
        diagnoses: formData.diagnoses.filter((d) => d.diagnosisName.trim().length > 0),
        doctorNotes: formData.doctorNotes,
        followUpRecommendations: {
          followUpRequired: formData.followUpRequired,
          followUpDate: formData.followUpDate || null,
          instructions: formData.followUpInstructions,
        },
      };

      const result = await clinicalService.createConsultation(payload);
      navigate(`/doctor/consultations/${result.data._id}`);
    } catch (err) {
      setApiError(err.message || 'Failed to record consultation. Please check required fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (!isDoctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <AlertBanner
          type="danger"
          title="Role Authorization Restriction"
          message="Only authorized medical doctors are licensed to record clinical consultations and finalize diagnoses. Please switch to the Doctor role in the top-right role switcher."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/doctor/appointments"
          className="text-xs font-medium text-[#787774] hover:text-[#191919] flex items-center gap-1 transition-colors"
        >
          ← Back to Appointment Queue
        </Link>
      </div>

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#191919] tracking-tight">
          Doctor's Consultation Form
        </h1>
        <p className="text-xs sm:text-sm text-[#787774]">
          Record patient complaints, examination findings, and diagnosis for appointment #{appointmentId}.
        </p>
      </div>

      {/* Patient Header Banner */}
      {patient && (
        <div className="bg-[#f7f6f3] border border-[#e9e9e7] rounded-none p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-none bg-[#f1f1ef] text-[#191919] border border-[#e5e5e3] flex items-center justify-center font-bold text-xs">
              {(patient.fullName || 'P')[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#191919]">{patient.fullName}</span>
                <Badge>{patient.universityId}</Badge>
              </div>
              <p className="text-[11px] text-[#787774] font-mono mt-0.5">
                Ref: {patient.patientId} • Blood: <strong className="text-[#191919]">{patient.bloodGroup || 'O+'}</strong>
              </p>
            </div>
          </div>
          <Link
            to={`/doctor/patients/${patient._id}/history`}
            target="_blank"
            className="text-xs font-medium text-[#191919] hover:bg-[#efefee] bg-white border border-[#e5e5e3] px-3 py-1.5 rounded-none transition-colors"
          >
            View Patient History ↗
          </Link>
        </div>
      )}

      {apiError && <AlertBanner type="danger" title="Validation Error" message={apiError} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Encounter Metadata */}
        <div className="bg-white p-6 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-4">
          <h3 className="font-serif font-bold text-base text-[#191919]">
            Date & Doctor on Duty
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Date of Visit
              </label>
              <input
                type="date"
                value={formData.consultationDate}
                onChange={(e) => setFormData({ ...formData, consultationDate: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Attending Doctor
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.title || 'Dr.'} ${currentUser.firstName} ${currentUser.lastName}`}
                className="w-full text-xs px-3 py-2 bg-[#f7f6f3] border border-[#e9e9e7] rounded-none text-[#787774]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Medical License No.
              </label>
              <input
                type="text"
                disabled
                value={currentUser.medicalLicenseNumber || 'MDC-88319-GH'}
                className="w-full text-xs px-3 py-2 bg-[#f7f6f3] border border-[#e9e9e7] rounded-none text-[#787774] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Vital Signs & Biometrics */}
        <VitalSignsInput
          vitals={formData.vitalSigns}
          onChange={(newVitals) => setFormData({ ...formData, vitalSigns: newVitals })}
        />

        {/* Section 3: Presenting Complaints & Reported Symptoms */}
        <div className="bg-white p-6 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-3">
            <h3 className="font-serif font-bold text-base text-[#191919]">
              Chief Complaints (What is bothering the patient?)
            </h3>
            <button
              type="button"
              onClick={addComplaint}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#191919] hover:bg-[#efefee] bg-[#f1f1ef] px-2.5 py-1 rounded-none border border-[#e5e5e3]"
            >
              + Add Another Complaint
            </button>
          </div>

          <div className="space-y-2.5">
            {formData.presentingComplaints.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2.5 bg-[#fbfbfa] p-2.5 rounded-none border border-[#e9e9e7]">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Chief Complaint (e.g. Severe sore throat, acute fever)..."
                    value={c.complaint}
                    onChange={(e) => handleComplaintChange(idx, 'complaint', e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#e5e5e3] rounded-none text-[#191919]"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="text"
                    placeholder="Duration (3 days)"
                    value={c.duration}
                    onChange={(e) => handleComplaintChange(idx, 'duration', e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#e5e5e3] rounded-none text-[#191919]"
                  />
                </div>
                <div className="w-28">
                  <select
                    value={c.severity}
                    onChange={(e) => handleComplaintChange(idx, 'severity', e.target.value)}
                    className="w-full text-xs px-2 py-2 bg-white border border-[#e5e5e3] rounded-none text-[#191919]"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                {formData.presentingComplaints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeComplaint(idx)}
                    className="px-2 py-1 text-xs text-[#787774] hover:text-[#191919] hover:bg-[#ececeb] rounded-none border border-[#e5e5e3]"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-[11px] font-medium text-[#787774] mb-1">
              Associated Symptoms (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. High fever, Dysphagia, Fatigue, Myalgia"
              value={formData.symptomsText}
              onChange={(e) => setFormData({ ...formData, symptomsText: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
            />
          </div>
        </div>

        {/* Section 4: Clinical Observations & Physical Findings */}
        <div className="bg-white p-6 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-3">
            <label className="font-serif font-bold text-base text-[#191919]">
              Doctor's Examination & Physical Findings *
            </label>
            <Badge>Required</Badge>
          </div>

          <textarea
            rows={4}
            placeholder="Write what you observed during the physical examination (e.g. Throat inflamed and red, chest clear, temperature elevated, no swollen glands)..."
            value={formData.clinicalObservations}
            onChange={(e) => setFormData({ ...formData, clinicalObservations: e.target.value })}
            className={`w-full text-xs sm:text-sm p-3.5 border rounded-none ${
              errors.clinicalObservations
                ? 'border-[#191919] bg-[#fbfbfa]'
                : 'border-[#e5e5e3] bg-[#fbfbfa] text-[#191919] focus:bg-white'
            }`}
          />
          {errors.clinicalObservations && (
            <p className="text-xs text-[#191919] font-medium">{errors.clinicalObservations}</p>
          )}
        </div>

        {/* Section 5: Diagnosis Recording */}
        <div className="bg-white p-6 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#f1f1ef] pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#191919]">
                Diagnosis (Identified Sickness or Condition) *
              </h3>
              <p className="text-[11px] text-[#787774]">
                Please write at least one diagnosis. This is saved to the patient's permanent clinic record.
              </p>
            </div>
            <button
              type="button"
              onClick={addDiagnosis}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#191919] hover:bg-[#efefee] bg-[#f1f1ef] px-2.5 py-1 rounded-none border border-[#e5e5e3]"
            >
              + Add Another Diagnosis
            </button>
          </div>

          {errors.diagnoses && (
            <p className="text-xs text-[#191919] font-medium">{errors.diagnoses}</p>
          )}

          <div className="space-y-3">
            {formData.diagnoses.map((diag, idx) => (
              <div key={idx} className="p-3.5 bg-[#fbfbfa] rounded-none border border-[#e9e9e7] space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-medium text-[#787774] mb-1">
                      Illness / Diagnosis Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Malaria, Acute Tonsillitis, Upper Respiratory Tract Infection"
                      value={diag.diagnosisName}
                      onChange={(e) => handleDiagnosisChange(idx, 'diagnosisName', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-[#e5e5e3] rounded-none text-[#191919]"
                    />
                  </div>
                  <div className="w-full sm:w-28">
                    <label className="block text-[11px] font-medium text-[#787774] mb-1">
                      ICD Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="B54"
                      value={diag.diagnosisCode}
                      onChange={(e) => handleDiagnosisChange(idx, 'diagnosisCode', e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-[#e5e5e3] rounded-none text-[#191919]"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-[11px] font-medium text-[#787774] mb-1">
                      Diagnosis Type
                    </label>
                    <select
                      value={diag.diagnosisType}
                      onChange={(e) => handleDiagnosisChange(idx, 'diagnosisType', e.target.value)}
                      className="w-full text-xs px-2 py-2 bg-white border border-[#e5e5e3] rounded-none text-[#191919]"
                    >
                      <option value="primary">Main (Primary)</option>
                      <option value="secondary">Secondary</option>
                      <option value="provisional">Provisional</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-[11px] font-medium text-[#787774] mb-1">
                      Severity
                    </label>
                    <select
                      value={diag.severity}
                      onChange={(e) => handleDiagnosisChange(idx, 'severity', e.target.value)}
                      className="w-full text-xs px-2 py-2 bg-white border border-[#e5e5e3] rounded-none text-[#191919]"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  {formData.diagnoses.length > 1 && (
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeDiagnosis(idx)}
                        className="px-2 py-1 text-xs text-[#787774] hover:text-[#191919] hover:bg-[#ececeb] rounded-none border border-[#e5e5e3]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Doctor's Clinical Notes & Follow-up */}
        <div className="bg-white p-6 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-4">
          <h3 className="font-serif font-bold text-base text-[#191919]">
            Doctor's Advice, Notes & Review Date
          </h3>

          <div>
            <label className="block text-[11px] font-medium text-[#787774] mb-1">
              Doctor's General Notes & Remarks
            </label>
            <textarea
              rows={3}
              placeholder="Doctor's notes on patient condition, advice given, or test recommendations..."
              value={formData.doctorNotes}
              onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
              className="w-full text-xs sm:text-sm p-3 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919] focus:bg-white"
            />
          </div>

          <div className="pt-2 border-t border-[#f1f1ef] space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={formData.followUpRequired}
                onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })}
                className="w-4 h-4 text-[#191919] rounded-none border-[#e5e5e3] focus:ring-0"
              />
              <label htmlFor="followUpRequired" className="text-xs font-medium text-[#191919]">
                Patient needs to return for a clinic review visit
              </label>
            </div>

            {formData.followUpRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-[#787774] mb-1">
                    Review Date
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#787774] mb-1">
                    Instructions to Patient
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Return in 3 days if fever does not stop; drink plenty of water"
                    value={formData.followUpInstructions}
                    onChange={(e) => setFormData({ ...formData, followUpInstructions: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/doctor/appointments"
            className="px-4 py-2.5 text-xs font-medium text-[#5a5a5a] hover:text-[#191919] hover:bg-[#f1f1ef] rounded-none"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#191919] hover:bg-[#333333] text-white font-medium text-xs sm:text-sm rounded-none shadow-notion-button transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Consultation Record'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsultationForm;
