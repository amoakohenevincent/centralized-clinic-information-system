import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
        <div className="h-8 bg-slate-200 rounded-xl w-1/3 animate-pulse"></div>
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
          <Link to="/doctor/patients" className="text-xs font-bold text-teal-700 hover:underline">
            Return to Patient Search
          </Link>
        </div>
      </div>
    );
  }

  const { patient, summary, consultationsTimeline, recordedDiagnosesHistory, previousPrescriptions } = historyData;

  const tabs = [
    { id: 'consultations', label: `Consultations (${consultationsTimeline.length})` },
    { id: 'diagnoses', label: `Diagnoses & Conditions (${recordedDiagnosesHistory.length})` },
    { id: 'prescriptions', label: `Prescriptions (${previousPrescriptions.length})` },
    { id: 'profile', label: 'Baseline & Health Background' },
  ];

  const initials = `${patient.fullName?.split(' ')[0]?.[0] || 'P'}${patient.fullName?.split(' ')[1]?.[0] || ''}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/doctor/patients"
          className="text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors"
        >
          ← Return to Patient Search Directory
        </Link>
      </div>

      {/* Patient Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-lg shrink-0">
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
                <span className="font-bold text-teal-800">ID: {patient.patientId}</span>
                <span>•</span>
                <span>University ID: {patient.universityId}</span>
                <span>•</span>
                <span className="capitalize">{patient.department || 'General'}</span>
              </div>
            </div>
          </div>

          <div>
            <Badge variant="neutral" className="text-xs py-1 px-3">
              Total Visits: {summary.totalVisits}
            </Badge>
          </div>
        </div>

        {/* Vital Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-slate-200">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              Gender & Age
            </span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm capitalize">
              {patient.gender} • {new Date(patient.dateOfBirth).toLocaleDateString()}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              Blood Group
            </span>
            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
              {summary.bloodGroup || 'Not Tested'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              Contact Phone
            </span>
            <span className="font-medium text-slate-800 text-xs sm:text-sm">
              {patient.phone || 'On File'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
              Emergency Contact
            </span>
            <span className="font-medium text-slate-800 text-xs sm:text-sm">
              {patient.emergencyContact?.name ? `${patient.emergencyContact.name} (${patient.emergencyContact.relationship})` : 'Registered'}
            </span>
          </div>
        </div>

        {/* Known Allergies Alert Banner */}
        {summary.knownAllergies && summary.knownAllergies.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-900 text-white">
            <div className="font-bold text-xs uppercase tracking-wider mb-2 text-teal-300">
              Medical Alert: Patient Has Documented Allergies
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.knownAllergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3 py-1 bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-lg"
                >
                  {allergy.allergen} ({allergy.category}) — {allergy.severity} [{allergy.reaction}]
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              All Diagnoses & Clinical Conditions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical record of medical diagnoses made across all clinic appointments
            </p>
          </div>

          {recordedDiagnosesHistory.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs">
              No historical diagnoses recorded for this patient.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Diagnosis Condition</th>
                    <th className="py-3 px-4">ICD-10 Code</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Clinical Status</th>
                    <th className="py-3 px-4">Diagnosed On</th>
                    <th className="py-3 px-4">Physician</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recordedDiagnosesHistory.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{d.diagnosisName}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-teal-800">{d.diagnosisCode || '—'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={d.diagnosisType === 'primary' ? 'teal' : 'neutral'}>
                          {d.diagnosisType === 'primary' ? 'Primary' : 'Secondary'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={d.severity === 'severe' ? 'urgent' : 'neutral'}>
                          {d.severity}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-semibold text-slate-700">{d.clinicalStatus || 'active'}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(d.consultationDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{d.doctorName}</td>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
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
                <div key={rx._id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                        {rx.prescriptionNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        Prescribed: {new Date(rx.prescriptionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge status={rx.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {rx.medications?.map((med, mIdx) => (
                      <div key={mIdx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900 text-sm">{med.medicationName}</div>
                        <div className="text-slate-600 mt-1">
                          Dosage: <strong className="text-teal-800">{med.dosage}</strong> • {med.frequency}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Duration: {med.duration}</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chronic Conditions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-base text-slate-900">
              Documented Chronic Conditions
            </h4>
            {summary.chronicConditions?.length === 0 ? (
              <p className="text-xs text-slate-400">No chronic medical conditions recorded.</p>
            ) : (
              <ul className="space-y-2">
                {summary.chronicConditions.map((c, idx) => (
                  <li key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 block">{c.condition}</span>
                      <span className="text-xs text-teal-700 font-mono">ICD-10: {c.icdCode || 'N/A'}</span>
                    </div>
                    <Badge variant="teal">{c.status || 'active'}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Past Surgeries & Immunizations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-base text-slate-900">
              Vaccinations & Surgical History
            </h4>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">
                  Surgical Procedures
                </span>
                {summary.pastSurgeries?.length === 0 ? (
                  <p className="text-slate-400 text-xs">No surgical history recorded.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {summary.pastSurgeries.map((s, idx) => (
                      <li key={idx} className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-800">{s.procedure}</span>
                        <span className="text-slate-500 font-medium">{s.year || 'N/A'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">
                  Immunization History
                </span>
                {summary.immunizationRecords?.length === 0 ? (
                  <p className="text-slate-400 text-xs">No immunization records on file.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {summary.immunizationRecords.map((imm, idx) => (
                      <li key={idx} className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
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
