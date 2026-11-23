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
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="h-8 bg-[#e9e9e7] rounded-none w-1/3 animate-pulse"></div>
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
          <Link to="/doctor/patients" className="text-xs font-semibold text-[#191919] hover:underline">
            ← Back to Patient Search
          </Link>
        </div>
      </div>
    );
  }

  const { patient, summary, consultationsTimeline, recordedDiagnosesHistory, previousPrescriptions } = historyData;

  const tabs = [
    { id: 'consultations', label: `Past Consultations (${consultationsTimeline.length})` },
    { id: 'diagnoses', label: `Diagnoses & Illnesses (${recordedDiagnosesHistory.length})` },
    { id: 'prescriptions', label: `Prescriptions & Drugs (${previousPrescriptions.length})` },
    { id: 'profile', label: 'Medical Background & Chronic Conditions' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/doctor/patients"
          className="text-xs font-semibold text-[#191919] hover:underline transition-colors"
        >
          ← Back to Patient Search
        </Link>
      </div>

      {/* Notion Document Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#191919] tracking-tight">
            {patient.fullName}
          </h1>
          <Badge variant="default">
            {patient.patientType}
          </Badge>
          <span className="font-mono text-xs font-bold text-[#191919] bg-[#f1f1ef] px-2 py-0.5 rounded-none border border-[#e5e5e3]">
            {patient.universityId}
          </span>
        </div>

        {/* Notion Property Table */}
        <div className="bg-white rounded-none border border-[#e9e9e7] p-5 shadow-notion-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#191919] text-[11px] block font-bold uppercase tracking-wider">Patient ID</span>
              <span className="font-mono font-bold text-[#191919]">{patient.patientId}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#191919] text-[11px] block font-bold uppercase tracking-wider">Sex & Date of Birth</span>
              <span className="font-medium text-[#191919] capitalize">
                {patient.gender} • {new Date(patient.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#191919] text-[11px] block font-bold uppercase tracking-wider">Blood Group</span>
              <span className="font-mono font-bold text-[#191919]">{summary.bloodGroup}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#191919] text-[11px] block font-bold uppercase tracking-wider">Total Clinic Visits</span>
              <span className="font-medium text-[#191919]">{summary.totalVisits} visits</span>
            </div>
          </div>
        </div>

        {/* High Risk / Allergies Banner (Notion Callout) */}
        {summary.knownAllergies && summary.knownAllergies.length > 0 && (
          <AlertBanner
            type="danger"
            title="Warning: Known Drug & Food Allergies"
          >
            <div className="mt-2 flex flex-wrap gap-2">
              {summary.knownAllergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 bg-[#f1f1ef] border border-[#e5e5e3] text-[#191919] text-xs font-semibold rounded-none"
                >
                  {allergy.allergen} ({allergy.category}) — {allergy.severity} [{allergy.reaction}]
                </span>
              ))}
            </div>
          </AlertBanner>
        )}
      </div>

      {/* Notion Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#e9e9e7] pb-2 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-none font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-[#191919] text-white'
                : 'text-[#191919] hover:bg-[#f1f1ef]'
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
            <h3 className="font-serif font-bold text-lg text-[#191919]">
              Past Consultation Notes
            </h3>
            <span className="text-xs text-[#191919]">Arranged from newest to oldest visit</span>
          </div>
          <ConsultationTimeline consultations={consultationsTimeline} />
        </div>
      )}

      {/* Tab 2: Recorded Diagnoses History */}
      {activeTab === 'diagnoses' && (
        <div className="bg-white rounded-none border border-[#e9e9e7] shadow-notion-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e9e9e7] bg-[#faf9f6]">
            <h3 className="font-serif font-bold text-base text-[#191919]">
              All Diagnoses & Illnesses Recorded
            </h3>
            <p className="text-[11px] text-[#191919] mt-0.5">
              Complete record of illnesses diagnosed during each clinic visit
            </p>
          </div>

          {recordedDiagnosesHistory.length === 0 ? (
            <div className="p-10 text-center text-[#191919]">
              <p className="text-xs">No diagnoses recorded yet for this patient.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf9f6] border-b border-[#e9e9e7] text-[#191919] font-bold">
                  <tr>
                    <th className="py-2.5 px-4 text-[#191919]">Diagnosis</th>
                    <th className="py-2.5 px-4 font-mono text-[#191919]">ICD Code</th>
                    <th className="py-2.5 px-4 text-[#191919]">Type</th>
                    <th className="py-2.5 px-4 text-[#191919]">Severity</th>
                    <th className="py-2.5 px-4 text-[#191919]">Status</th>
                    <th className="py-2.5 px-4 text-[#191919]">Date Diagnosed</th>
                    <th className="py-2.5 px-4 text-[#191919]">Doctor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f1ef]">
                  {recordedDiagnosesHistory.map((d, idx) => (
                    <tr key={idx} className="hover:bg-[#fbfbfa]">
                      <td className="py-3 px-4 font-bold text-[#191919]">{d.diagnosisName}</td>
                      <td className="py-3 px-4 font-mono font-medium text-[#191919]">{d.diagnosisCode || '—'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="default">
                          {d.diagnosisType === 'primary' ? 'Main Diagnosis' : 'Secondary'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default">
                          {d.severity}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold text-[#191919]">{d.clinicalStatus || 'active'}</td>
                      <td className="py-3 px-4 text-[#191919]">
                        {new Date(d.consultationDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#191919]">{d.doctorName}</td>
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
        <div className="bg-white rounded-none border border-[#e9e9e7] shadow-notion-card p-6 space-y-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#191919]">
              Prescriptions & Medications Dispensed
            </h3>
            <p className="text-xs text-[#191919] mt-0.5">
              Medications prescribed to this patient and dispensed at the clinic dispensary
            </p>
          </div>

          {previousPrescriptions.length === 0 ? (
            <div className="p-8 text-center text-[#191919]">
              <p className="text-xs">No previous prescription records on file.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {previousPrescriptions.map((rx) => (
                <div key={rx._id} className="border border-[#e9e9e7] rounded-none p-4 bg-[#fbfbfa]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-none bg-[#f1f1ef] text-[#191919] border border-[#e5e5e3]">
                        {rx.prescriptionNumber}
                      </span>
                      <span className="text-xs text-[#191919]">
                        Issued on: {new Date(rx.prescriptionDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="default">
                      {rx.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {rx.medications?.map((med, mIdx) => (
                      <div key={mIdx} className="bg-white p-3 rounded-none border border-[#e9e9e7] text-xs">
                        <div className="font-bold text-[#191919]">{med.medicationName}</div>
                        <div className="text-[#191919] mt-0.5">
                          Dosage: <strong>{med.dosage}</strong> • {med.frequency}
                        </div>
                        <div className="text-[11px] text-[#5a5a5a] mt-1">Duration: {med.duration}</div>
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
          <div className="bg-white p-6 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-3">
            <h4 className="font-serif font-bold text-base text-[#191919]">
              Chronic Medical Conditions
            </h4>
            {summary.chronicConditions?.length === 0 ? (
              <p className="text-xs text-[#5a5a5a]">No chronic conditions recorded.</p>
            ) : (
              <ul className="space-y-2">
                {summary.chronicConditions.map((c, idx) => (
                  <li key={idx} className="p-3 bg-[#fbfbfa] rounded-none border border-[#e9e9e7] text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#191919] block">{c.condition}</span>
                      <span className="text-[11px] text-[#191919] font-mono">ICD: {c.icdCode || 'N/A'}</span>
                    </div>
                    <Badge variant="default">{c.status || 'active'}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Past Surgeries & Immunizations */}
          <div className="bg-white p-6 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-4">
            <h4 className="font-serif font-bold text-base text-[#191919]">
              Vaccinations & Surgical History
            </h4>
            <div className="space-y-3 text-xs">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#191919] block">
                Surgical History
              </span>
              {summary.pastSurgeries?.length === 0 ? (
                <p className="text-xs text-[#5a5a5a]">No past surgeries recorded.</p>
              ) : (
                <ul className="space-y-1.5">
                  {summary.pastSurgeries.map((s, idx) => (
                    <li key={idx} className="flex justify-between p-2 bg-[#fbfbfa] rounded-none border border-[#e9e9e7]">
                      <span className="font-bold text-[#191919]">{s.procedure}</span>
                      <span className="text-[#191919]">{s.year || 'N/A'}</span>
                    </li>
                  ))}
                </ul>
              )}

              <span className="text-[11px] uppercase font-bold tracking-wider text-[#191919] block pt-2">
                Immunizations & Vaccines
              </span>
              {summary.immunizationRecords?.length === 0 ? (
                <p className="text-xs text-[#5a5a5a]">No immunizations recorded.</p>
              ) : (
                <ul className="space-y-1.5">
                  {summary.immunizationRecords.map((imm, idx) => (
                    <li key={idx} className="flex justify-between p-2 bg-[#fbfbfa] rounded-none border border-[#e9e9e7]">
                      <span className="font-bold text-[#191919]">{imm.vaccineName} (Dose {imm.doseNumber})</span>
                      <span className="text-[#191919]">{new Date(imm.administeredDate).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMedicalHistory;
