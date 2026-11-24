import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Stethoscope,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
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
      errs.clinicalObservations = 'Clinical observations and examination notes are mandatory.';
    }

    const hasValidDiagnosis = formData.diagnoses.some((d) => d.diagnosisName.trim().length > 0);
    if (!hasValidDiagnosis) {
      errs.diagnoses = 'At least one primary medical diagnosis must be recorded.';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          to="/doctor/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Waiting Queue</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Clinical Encounter Documentation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor's Clinical Consultation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conduct examination, log patient complaints, measure vital signs, and assign formal diagnoses.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
          <Stethoscope className="w-4 h-4 text-teal-600" />
          <span>Appointment #{appointmentId}</span>
        </div>
      </div>

      {/* Patient Header Banner */}
      {patient && (
        <div className="bg-gradient-to-r from-teal-50/60 to-slate-50 border border-teal-100 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {(patient.fullName || 'P')[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900">{patient.fullName}</span>
                <Badge variant="teal">{patient.universityId}</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Ref: {patient.patientId} • Blood Group: <strong className="text-rose-600">{patient.bloodGroup || 'O+'}</strong>
              </p>
            </div>
          </div>
          <Link
            to={`/doctor/patients/${patient._id}/history`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-white hover:bg-teal-50 border border-teal-200 px-3.5 py-2 rounded-2xl shadow-xs transition-all"
          >
            <span>View Medical History</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {apiError && <AlertBanner type="danger" title="Validation Error" message={apiError} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Encounter Metadata */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Encounter Details & Attending Physician</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Consultation Date
              </label>
              <input
                type="date"
                value={formData.consultationDate}
                onChange={(e) => setFormData({ ...formData, consultationDate: e.target.value })}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Attending Physician
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.title || 'Dr.'} ${currentUser.firstName} ${currentUser.lastName}`}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Medical License Registration
              </label>
              <input
                type="text"
                disabled
                value={currentUser.medicalLicenseNumber || 'MDC-88319-GH'}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-600 font-mono"
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
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Chief Presenting Complaints & Symptoms
            </h3>
            <button
              type="button"
              onClick={addComplaint}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/70 px-3 py-1.5 rounded-xl border border-teal-200 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Complaint</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.presentingComplaints.map((c, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Chief Complaint (e.g. Severe sore throat, acute fever, headache)..."
                    value={c.complaint}
                    onChange={(e) => handleComplaintChange(idx, 'complaint', e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                  />
                </div>
                <div className="w-full sm:w-36">
                  <input
                    type="text"
                    placeholder="Duration (e.g. 3 days)"
                    value={c.duration}
                    onChange={(e) => handleComplaintChange(idx, 'duration', e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <select
                    value={c.severity}
                    onChange={(e) => handleComplaintChange(idx, 'severity', e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
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
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Associated Symptoms (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. High fever, Dysphagia, Fatigue, Myalgia, Chills"
              value={formData.symptomsText}
              onChange={(e) => setFormData({ ...formData, symptomsText: e.target.value })}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
          </div>
        </div>

        {/* Section 4: Clinical Observations & Physical Findings */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <label className="text-base font-bold text-slate-900">
              Doctor's Examination & Clinical Observations *
            </label>
            <Badge variant="urgent">Mandatory</Badge>
          </div>

          <textarea
            rows={4}
            placeholder="Document examination findings (e.g. Pharynx congested with purulent tonsillar exudates, chest clear on auscultation, no localized lymphadenopathy)..."
            value={formData.clinicalObservations}
            onChange={(e) => setFormData({ ...formData, clinicalObservations: e.target.value })}
            className={`w-full text-xs sm:text-sm p-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400/20 ${
              errors.clinicalObservations
                ? 'border-rose-400 bg-rose-50/30'
                : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white'
            }`}
          />
          {errors.clinicalObservations && (
            <p className="text-xs text-rose-600 font-bold">{errors.clinicalObservations}</p>
          )}
        </div>

        {/* Section 5: Diagnosis Recording */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Medical Diagnoses (Identified Conditions) *
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign clinical conditions to update the patient's permanent medical records.
              </p>
            </div>
            <button
              type="button"
              onClick={addDiagnosis}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/70 px-3 py-1.5 rounded-xl border border-teal-200 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Diagnosis</span>
            </button>
          </div>

          {errors.diagnoses && (
            <p className="text-xs text-rose-600 font-bold">{errors.diagnoses}</p>
          )}

          <div className="space-y-3">
            {formData.diagnoses.map((diag, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Illness / Diagnosis Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Malaria, Acute Tonsillitis, Acute Bronchitis"
                      value={diag.diagnosisName}
                      onChange={(e) => handleDiagnosisChange(idx, 'diagnosisName', e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ICD-10 Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B54, J03.9"
                      value={diag.diagnosisCode}
                      onChange={(e) => handleDiagnosisChange(idx, 'diagnosisCode', e.target.value)}
                      className="w-full text-xs sm:text-sm font-mono px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Diagnosis Type
                    </label>
                    <select
                      value={diag.diagnosisType}
                      onChange={(e) => handleDiagnosisChange(idx, 'diagnosisType', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="provisional">Provisional</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Severity
                    </label>
                    <select
                      value={diag.severity}
                      onChange={(e) => handleDiagnosisChange(idx, 'severity', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
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
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Doctor's Clinical Notes & Follow-up */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Doctor's Advice, Clinical Notes & Review
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Doctor's Remarks & Clinical Guidance
            </label>
            <textarea
              rows={3}
              placeholder="Clinical recommendations, lifestyle advice, diet, hydration, or lab test requests..."
              value={formData.doctorNotes}
              onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
              className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={formData.followUpRequired}
                onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
              />
              <label htmlFor="followUpRequired" className="text-xs font-bold text-slate-800 cursor-pointer">
                Patient requires follow-up clinic review visit
              </label>
            </div>

            {formData.followUpRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Scheduled Review Date
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Return in 3 days if symptoms persist; take full antibiotics course"
                    value={formData.followUpInstructions}
                    onChange={(e) => setFormData({ ...formData, followUpInstructions: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
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
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Finalizing Record...' : 'Complete & Save Consultation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsultationForm;
