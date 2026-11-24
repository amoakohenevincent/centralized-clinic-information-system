import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Activity,
  FileText,
  Pill,
  Heart,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { clinicalService } from '../services/clinicalService';
import { useAuth } from '../context/AuthContext';
import ConsultationTimeline from '../components/clinical/ConsultationTimeline';
import AlertBanner from '../components/common/AlertBanner';
import Badge from '../components/common/Badge';
import { SkeletonCard } from '../components/common/LoadingSkeleton';

const PatientMedicalHistory = () => {
  const { patientId } = useParams();
  const { isDoctor, isNurse, isAdmin, currentUser } = useAuth();

  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('consultations');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await clinicalService.getPatientMedicalHistory(patientId);
        setHistoryData(data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve patient medical history.');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchHistory();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="h-8 bg-slate-200 rounded-full w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !historyData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <AlertBanner type="danger" title="Medical History Access Error" message={error || 'Patient record could not be loaded.'} />
        <div className="mt-4">
          <Link to="/doctor/patients" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700">
            <ArrowLeft className="w-4 h-4" /> Back to Patient Search
          </Link>
        </div>
      </div>
    );
  }

  const { patient, summary, consultationsTimeline, recordedDiagnosesHistory, previousPrescriptions } = historyData;

  const tabs = [
    { id: 'consultations', label: `Consultations (${consultationsTimeline.length})`, icon: FileText },
    { id: 'diagnoses', label: `Diagnoses & Conditions (${recordedDiagnosesHistory.length})`, icon: Activity },
    { id: 'prescriptions', label: `Prescriptions (${previousPrescriptions.length})`, icon: Pill },
    { id: 'profile', label: 'Baseline & Health Background', icon: Heart },
  ];

  const initials = `${patient.fullName?.split(' ')[0]?.[0] || 'P'}${patient.fullName?.split(' ')[1]?.[0] || ''}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          to="/doctor/patients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Patient Search Directory</span>
        </Link>
      </div>

      {/* MediWell Patient Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {patient.fullName}
                </h1>
                <Badge variant="teal" className="capitalize">
                  {patient.patientType}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="font-bold text-teal-700">ID: {patient.patientId}</span>
                <span>•</span>
                <span>University ID: {patient.universityId}</span>
                <span>•</span>
                <span className="capitalize">{patient.department || 'General'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="text-xs py-1 px-3">
              Total Visits: {summary.totalVisits}
            </Badge>
          </div>
        </div>

        {/* Vital Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
              Gender & Age
            </span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm capitalize">
              {patient.gender} • {new Date(patient.dateOfBirth).toLocaleDateString()}
            </span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
              Blood Group
            </span>
            <span className="font-mono font-extrabold text-rose-600 text-xs sm:text-sm">
              {summary.bloodGroup || 'Not Tested'}
            </span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
              Contact Phone
            </span>
            <span className="font-medium text-slate-800 text-xs sm:text-sm">
              {patient.phone || 'On File'}
            </span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
              Emergency Contact
            </span>
            <span className="font-medium text-slate-800 text-xs sm:text-sm">
              {patient.emergencyContact?.name ? `${patient.emergencyContact.name} (${patient.emergencyContact.relationship})` : 'Registered'}
            </span>
          </div>
        </div>

        {/* Known Allergies Alert Banner */}
        {summary.knownAllergies && summary.knownAllergies.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Medical Alert: Patient Has Documented Allergies</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {summary.knownAllergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 bg-white border border-rose-200 text-rose-800 text-xs font-bold rounded-xl shadow-xs"
                >
                  {allergy.allergen} ({allergy.category}) — {allergy.severity} [{allergy.reaction}]
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Chronological Consultations */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Past Consultation Timeline
            </h3>
            <span className="text-xs text-slate-500">Ordered by visit date</span>
          </div>
          <ConsultationTimeline consultations={consultationsTimeline} />
        </div>
      )}

      {/* Tab 2: Recorded Diagnoses History */}
      {activeTab === 'diagnoses' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h3 className="font-bold text-sm text-slate-900">
              All Diagnoses & Clinical Conditions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical record of medical diagnoses made across all clinic appointments
            </p>
          </div>

          {recordedDiagnosesHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No historical diagnoses recorded for this patient.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-5">Diagnosis Condition</th>
                    <th className="py-3 px-5">ICD-10 Code</th>
                    <th className="py-3 px-5">Type</th>
                    <th className="py-3 px-5">Severity</th>
                    <th className="py-3 px-5">Clinical Status</th>
                    <th className="py-3 px-5">Diagnosed On</th>
                    <th className="py-3 px-5">Physician</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recordedDiagnosesHistory.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900">{d.diagnosisName}</td>
                      <td className="py-4 px-5 font-mono font-semibold text-teal-700">{d.diagnosisCode || '—'}</td>
                      <td className="py-4 px-5">
                        <Badge variant={d.diagnosisType === 'primary' ? 'teal' : 'neutral'}>
                          {d.diagnosisType === 'primary' ? 'Primary' : 'Secondary'}
                        </Badge>
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant={d.severity === 'severe' ? 'urgent' : d.severity === 'moderate' ? 'amber' : 'neutral'}>
                          {d.severity}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 capitalize font-semibold text-slate-700">{d.clinicalStatus || 'active'}</td>
                      <td className="py-4 px-5 text-slate-600">
                        {new Date(d.consultationDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-800">{d.doctorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Previous Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Prescriptions & Dispensed Medications
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Prescribed medications issued to this patient and fulfilled at the clinic pharmacy
            </p>
          </div>

          {previousPrescriptions.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs">
              No previous prescription records on file for this patient.
            </div>
          ) : (
            <div className="space-y-4">
              {previousPrescriptions.map((rx) => (
                <div key={rx._id} className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                        {rx.prescriptionNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        Prescribed: {new Date(rx.prescriptionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant={rx.status === 'fulfilled' ? 'completed' : 'amber'}>
                      {rx.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {rx.medications?.map((med, mIdx) => (
                      <div key={mIdx} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs text-xs">
                        <div className="font-bold text-slate-900 text-sm">{med.medicationName}</div>
                        <div className="text-slate-600 mt-1">
                          Dosage: <strong className="text-teal-700">{med.dosage}</strong> • {med.frequency}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Duration: {med.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Chronic Conditions & Baseline Profile */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Chronic Conditions */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <h4 className="font-bold text-base text-slate-900">
              Documented Chronic Conditions
            </h4>
            {summary.chronicConditions?.length === 0 ? (
              <p className="text-xs text-slate-400">No chronic medical conditions recorded.</p>
            ) : (
              <ul className="space-y-2.5">
                {summary.chronicConditions.map((c, idx) => (
                  <li key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">{c.condition}</span>
                      <span className="text-xs text-teal-600 font-mono">ICD-10: {c.icdCode || 'N/A'}</span>
                    </div>
                    <Badge variant="teal">{c.status || 'active'}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Past Surgeries & Immunizations */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <h4 className="font-bold text-base text-slate-900">
              Vaccinations & Surgical History
            </h4>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                  Surgical Procedures
                </span>
                {summary.pastSurgeries?.length === 0 ? (
                  <p className="text-slate-400 text-xs">No surgical history recorded.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {summary.pastSurgeries.map((s, idx) => (
                      <li key={idx} className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800">{s.procedure}</span>
                        <span className="text-slate-500 font-medium">{s.year || 'N/A'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                  Immunization History
                </span>
                {summary.immunizationRecords?.length === 0 ? (
                  <p className="text-slate-400 text-xs">No immunization records on file.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {summary.immunizationRecords.map((imm, idx) => (
                      <li key={idx} className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800">{imm.vaccineName} (Dose {imm.doseNumber})</span>
                        <span className="text-slate-500 font-medium">{new Date(imm.administeredDate).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMedicalHistory;

