import api from './api';
import { mockPatients, mockAppointments, mockDoctor } from './mockSharedData';

export const clinicalService = {
  // 1. Dashboard & Queue
  async getDashboardStats() {
    try {
      const response = await api.get('/clinical/dashboard/stats');
      return response.data;
    } catch (err) {
      console.warn('[ClinicalService] Backend unreachable, returning mock dashboard stats.');
      return {
        todayAppointments: 8,
        upcomingAppointments: 14,
        awaitingConsultation: 3,
        completedToday: 5,
        totalConsultations: 142,
      };
    }
  },

  async getAppointmentQueue(status = 'all', date) {
    try {
      const params = {};
      if (status && status !== 'all') params.status = status;
      if (date) params.date = date;
      const response = await api.get('/clinical/dashboard/queue', { params });
      return response.data;
    } catch (err) {
      console.warn('[ClinicalService] Backend unreachable, returning mock queue.');
      return mockAppointments;
    }
  },

  // 2. Patient Search
  async searchPatients(query = '', page = 1, limit = 20) {
    try {
      const response = await api.get('/clinical/patients/search', {
        params: { query, page, limit },
      });
      return response;
    } catch (err) {
      console.warn('[ClinicalService] Backend unreachable, returning mock patient search.');
      const q = query.toLowerCase();
      const filtered = mockPatients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.patientId.toLowerCase().includes(q) ||
          p.universityId.toLowerCase().includes(q)
      );
      return {
        data: filtered,
        pagination: { total: filtered.length, page: 1, limit: 20, totalPages: 1 },
      };
    }
  },

  // 3. Medical History
  async getPatientMedicalHistory(patientId) {
    try {
      const response = await api.get(`/medical-records/patient/${patientId}`);
      return response.data;
    } catch (err) {
      console.warn('[ClinicalService] Returning mock medical history for patient:', patientId);
      const patient = mockPatients.find((p) => p._id === patientId) || mockPatients[0];
      return {
        patient,
        summary: {
          totalVisits: 3,
          lastVisitDate: '2026-11-10T09:30:00Z',
          bloodGroup: patient.bloodGroup || 'O+',
          knownAllergies: [
            { allergen: 'Penicillin', category: 'drug', reaction: 'Skin rash & hives', severity: 'moderate' },
            { allergen: 'Peanuts', category: 'food', reaction: 'Anaphylaxis', severity: 'life-threatening' },
          ],
          chronicConditions: [
            { condition: 'Bronchial Asthma', icdCode: 'J45.909', status: 'managed', diagnosedDate: '2019-04-12' },
          ],
          pastSurgeries: [
            { procedure: 'Appendectomy', year: 2021, hospital: 'Korle-Bu Teaching Hospital, Accra' },
          ],
          immunizationRecords: [
            { vaccineName: 'Hepatitis B', administeredDate: '2022-08-10', doseNumber: 3 },
            { vaccineName: 'Tetanus Toxoid', administeredDate: '2024-01-15', doseNumber: 1 },
          ],
        },
        consultationsTimeline: [
          {
            _id: 'cns_demo_01',
            consultationNumber: 'CNS-2026-0042',
            consultationDate: '2026-11-10T09:30:00Z',
            clinicalObservations: 'Pharynx inflamed with tonsillar hypertrophy. Chest clear to auscultation.',
            vitalSigns: { bloodPressure: '120/80', heartRate: 78, temperature: 37.8, bmi: 22.4 },
            diagnoses: [
              { diagnosisName: 'Acute Pharyngitis', diagnosisCode: 'J02.9', diagnosisType: 'primary', severity: 'moderate' },
            ],
            doctorNotes: 'Prescribed warm saline gargle and analgesic relief.',
            doctorId: mockDoctor,
          },
        ],
        recordedDiagnosesHistory: [
          {
            diagnosisName: 'Acute Pharyngitis',
            diagnosisCode: 'J02.9',
            diagnosisType: 'primary',
            severity: 'moderate',
            consultationDate: '2026-11-10T09:30:00Z',
            doctorName: 'Dr. Kwabena Mensah',
          },
        ],
        previousPrescriptions: [
          {
            _id: 'rx_demo_01',
            prescriptionNumber: 'RX-2026-0012',
            prescriptionDate: '2026-11-10T09:45:00Z',
            status: 'dispensed',
            medications: [
              { medicationName: 'Paracetamol', dosage: '500mg', frequency: 'TDS (3x daily)', duration: '5 days' },
              { medicationName: 'Cetirizine', dosage: '10mg', frequency: 'OD (once daily)', duration: '7 days' },
            ],
          },
        ],
      };
    }
  },

  // 4. Consultations
  async createConsultation(payload) {
    const response = await api.post('/consultations', payload);
    return response.data;
  },

  async getConsultationById(id) {
    try {
      const response = await api.get(`/consultations/${id}`);
      return response.data;
    } catch (err) {
      console.warn('[ClinicalService] Returning mock consultation details.');
      return {
        _id: id,
        consultationNumber: 'CNS-2026-0088',
        consultationDate: new Date().toISOString(),
        patientId: mockPatients[0],
        doctorId: mockDoctor,
        appointmentId: mockAppointments[0],
        status: 'completed',
        vitalSigns: {
          bloodPressure: '122/80',
          heartRate: 82,
          temperature: 38.2,
          respiratoryRate: 18,
          oxygenSaturation: 98,
          weight: 68,
          height: 174,
          bmi: 22.5,
        },
        presentingComplaints: [
          { complaint: 'Severe throat pain and painful swallowing', duration: '3 days', severity: 'severe' },
        ],
        symptoms: ['Fever', 'Sore Throat', 'Myalgia'],
        clinicalObservations: 'Severe erythema of the oropharynx, exudates on left palatine tonsil.',
        diagnoses: [
          {
            diagnosisName: 'Acute Tonsillitis',
            diagnosisCode: 'J03.90',
            diagnosisType: 'primary',
            severity: 'moderate',
            notes: 'Suspected bacterial etiology',
          },
        ],
        doctorNotes: 'Advised oral rehydration and 7-day antibiotic course.',
        followUpRecommendations: {
          followUpRequired: true,
          followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          instructions: 'Return to clinic if fever persists after 48h of antibiotics.',
        },
        prescriptionHandoff: {
          initiated: false,
          status: 'none',
        },
        auditTrail: [],
      };
    }
  },

  async getPatientConsultations(patientId, params = {}) {
    try {
      const response = await api.get(`/consultations/patient/${patientId}`, { params });
      return response;
    } catch (err) {
      return {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
    }
  },

  async updateConsultation(id, updateData) {
    const response = await api.put(`/consultations/${id}`, updateData);
    return response.data;
  },

  // 5. Diagnosis Recording
  async recordDiagnosis(consultationId, diagnosisPayload) {
    const response = await api.patch(`/consultations/${consultationId}/diagnoses`, diagnosisPayload);
    return response.data;
  },

  // 6. Prescription Handoff
  async initiatePrescriptionHandoff(consultationId, handoffNotes = '') {
    const response = await api.post('/clinical/prescription-handoff', {
      consultationId,
      handoffNotes,
    });
    return response.data;
  },

  async getPrescriptionHandoffStatus(consultationId) {
    const response = await api.get(`/clinical/prescription-handoff/${consultationId}/status`);
    return response.data;
  },
};

