/**
 * CCIS Prescription Service
 * Connects Frontend UI to Backend REST Endpoints with built-in resilience.
 * If backend server is unreachable (e.g., during UI testing), transparently uses
 * persistent local storage and fictional mock data.
 */

const API_BASE = '/api/prescriptions';

// Shared medicine catalogue stub reflecting Madam Sarah's Pharmacy Module catalogue
export const INITIAL_MEDICINE_CATALOGUE = [
  {
    _id: '654c09ef1b4e2d001a23ba10',
    code: 'MED-AMX-500',
    name: 'Amoxicillin Trihydrate',
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    strength: '500mg',
    form: 'Capsule',
    unitOfMeasure: 'Capsule',
    currentStock: 180,
    reorderLevel: 30,
    isControlled: false,
    isActive: true
  },
  {
    _id: '654c09ef1b4e2d001a23ba25',
    code: 'MED-PCM-500',
    name: 'Paracetamol BP',
    genericName: 'Acetaminophen',
    category: 'Analgesics & Antipyretics',
    strength: '500mg',
    form: 'Tablet',
    unitOfMeasure: 'Tablet',
    currentStock: 450,
    reorderLevel: 50,
    isControlled: false,
    isActive: true
  },
  {
    _id: '654c09ef1b4e2d001a23ba33',
    code: 'MED-IBU-400',
    name: 'Ibuprofen BP',
    genericName: 'Ibuprofen',
    category: 'NSAIDs',
    strength: '400mg',
    form: 'Tablet',
    unitOfMeasure: 'Tablet',
    currentStock: 95,
    reorderLevel: 25,
    isControlled: false,
    isActive: true
  },
  {
    _id: '654c09ef1b4e2d001a23ba48',
    code: 'MED-MET-500',
    name: 'Metformin Hydrochloride',
    genericName: 'Metformin',
    category: 'Antidiabetics',
    strength: '500mg',
    form: 'Tablet',
    unitOfMeasure: 'Tablet',
    currentStock: 220,
    reorderLevel: 40,
    isControlled: false,
    isActive: true
  },
  {
    _id: '654c09ef1b4e2d001a23ba59',
    code: 'MED-AML-010',
    name: 'Amlodipine Besylate',
    genericName: 'Amlodipine',
    category: 'Antihypertensives',
    strength: '10mg',
    form: 'Tablet',
    unitOfMeasure: 'Tablet',
    currentStock: 140,
    reorderLevel: 20,
    isControlled: false,
    isActive: true
  },
  {
    _id: '654c09ef1b4e2d001a23ba62',
    code: 'MED-SLB-100',
    name: 'Salbutamol Inhaler',
    genericName: 'Albuterol',
    category: 'Respiratory / Bronchodilators',
    strength: '100mcg/dose',
    form: 'Inhaler',
    unitOfMeasure: 'Canister',
    currentStock: 8, // Low stock indicator
    reorderLevel: 15,
    isControlled: false,
    isActive: true
  },
  {
    _id: '654c09ef1b4e2d001a23ba77',
    code: 'MED-AZI-500',
    name: 'Azithromycin Monohydrate',
    genericName: 'Azithromycin',
    category: 'Antibiotics',
    strength: '500mg',
    form: 'Tablet',
    unitOfMeasure: 'Tablet',
    currentStock: 0, // Out of stock / backorder candidate
    reorderLevel: 20,
    isControlled: false,
    isActive: true
  },
  {
    _id: '654c09ef1b4e2d001a23ba88',
    code: 'MED-TRM-050',
    name: 'Tramadol Hydrochloride',
    genericName: 'Tramadol',
    category: 'Opioid Analgesics',
    strength: '500mg',
    form: 'Capsule',
    unitOfMeasure: 'Capsule',
    currentStock: 60,
    reorderLevel: 20,
    isControlled: true, // Controlled medication
    isActive: true
  }
];

// Initial realistic prescriptions for university clinic
const INITIAL_PRESCRIPTIONS = [
  {
    _id: 'rx_001',
    prescriptionNumber: 'RX-202611-0001',
    patientId: 'pat_001',
    patientName: 'Kofi Mensah',
    patientIdentifier: 'STU-2024-8841',
    doctorId: '654c00011b4e2d001a23ba01',
    doctorName: 'Dr. John Mensah, MD',
    consultationId: 'con_001',
    prescriptionDate: '2026-11-17T09:30:00.000Z',
    status: 'pending',
    clinicalDiagnosis: 'Acute Bacterial Tonsillitis',
    generalInstructions: 'Complete full antibiotic course. Avoid very cold drinks.',
    isControlledMedication: false,
    items: [
      {
        _id: 'item_1_1',
        medicineId: '654c09ef1b4e2d001a23ba10',
        medicineName: 'Amoxicillin Trihydrate',
        strength: '500mg',
        form: 'Capsule',
        dosage: '1 capsule',
        frequency: 'Three times daily (TDS)',
        duration: '7 days',
        quantityPrescribed: 21,
        quantityDispensed: 0,
        itemStatus: 'pending',
        instructions: 'Take after meals every 8 hours'
      },
      {
        _id: 'item_1_2',
        medicineId: '654c09ef1b4e2d001a23ba25',
        medicineName: 'Paracetamol BP',
        strength: '500mg',
        form: 'Tablet',
        dosage: '2 tablets',
        frequency: 'As needed / PRN',
        duration: '3 days',
        quantityPrescribed: 12,
        quantityDispensed: 0,
        itemStatus: 'pending',
        instructions: 'Take for fever or severe throat pain'
      }
    ],
    auditTrail: [
      {
        modifiedAt: '2026-11-17T09:30:00.000Z',
        action: 'created',
        reason: 'Prescription created following consultation'
      }
    ],
    dispensingHistory: []
  },
  {
    _id: 'rx_002',
    prescriptionNumber: 'RX-202611-0002',
    patientId: 'pat_002',
    patientName: 'Ama Serwaa',
    patientIdentifier: 'STU-2023-4109',
    doctorId: '654c00011b4e2d001a23ba01',
    doctorName: 'Dr. John Mensah, MD',
    consultationId: 'con_002',
    prescriptionDate: '2026-11-16T14:15:00.000Z',
    status: 'partially_dispensed',
    clinicalDiagnosis: 'Bronchial Asthma Exacerbation',
    generalInstructions: 'Rinse mouth after using inhaler. Seek urgent care if wheezing worsens.',
    isControlledMedication: false,
    items: [
      {
        _id: 'item_2_1',
        medicineId: '654c09ef1b4e2d001a23ba62',
        medicineName: 'Salbutamol Inhaler',
        strength: '100mcg/dose',
        form: 'Inhaler',
        dosage: '2 puffs',
        frequency: 'As needed / PRN',
        duration: '30 days',
        quantityPrescribed: 1,
        quantityDispensed: 1,
        itemStatus: 'dispensed',
        instructions: 'Inhale 2 puffs when experiencing shortness of breath'
      },
      {
        _id: 'item_2_2',
        medicineId: '654c09ef1b4e2d001a23ba77',
        medicineName: 'Azithromycin Monohydrate',
        strength: '500mg',
        form: 'Tablet',
        dosage: '1 tablet',
        frequency: 'Once daily (OD)',
        duration: '3 days',
        quantityPrescribed: 3,
        quantityDispensed: 0,
        itemStatus: 'backordered',
        instructions: 'Out of stock in clinic pharmacy. Pending supplier restock.'
      }
    ],
    auditTrail: [
      {
        modifiedAt: '2026-11-16T14:15:00.000Z',
        action: 'created',
        reason: 'Prescription created'
      },
      {
        modifiedAt: '2026-11-16T15:00:00.000Z',
        action: 'dispense_recorded',
        reason: 'Inhaler dispensed. Azithromycin marked pending backorder.'
      }
    ],
    dispensingHistory: [
      {
        dispensedAt: '2026-11-16T15:00:00.000Z',
        pharmacistId: '654c00021b4e2d001a23ba02',
        pharmacistName: 'Pharm. Sarah Boateng',
        notes: 'Salbutamol dispensed. Azithromycin currently stock-out; informed patient to return in 48 hours.',
        itemsDispensed: [
          { medicineId: '654c09ef1b4e2d001a23ba62', dispensedQuantity: 1, batchNumber: 'SLB-2026-04' }
        ]
      }
    ]
  },
  {
    _id: 'rx_003',
    prescriptionNumber: 'RX-202611-0003',
    patientId: 'pat_003',
    patientName: 'Prof. Ernest Addo',
    patientIdentifier: 'STF-1998-0042',
    doctorId: '654c00011b4e2d001a23ba01',
    doctorName: 'Dr. John Mensah, MD',
    consultationId: 'con_003',
    prescriptionDate: '2026-11-15T11:00:00.000Z',
    status: 'fulfilled',
    clinicalDiagnosis: 'Essential Hypertension & Type 2 Diabetes Routine Refill',
    generalInstructions: 'Maintain low-salt diet and regular morning blood sugar checks.',
    isControlledMedication: false,
    items: [
      {
        _id: 'item_3_1',
        medicineId: '654c09ef1b4e2d001a23ba59',
        medicineName: 'Amlodipine Besylate',
        strength: '10mg',
        form: 'Tablet',
        dosage: '1 tablet',
        frequency: 'Once daily (OD)',
        duration: '30 days',
        quantityPrescribed: 30,
        quantityDispensed: 30,
        itemStatus: 'dispensed',
        instructions: 'Take every morning with water'
      },
      {
        _id: 'item_3_2',
        medicineId: '654c09ef1b4e2d001a23ba48',
        medicineName: 'Metformin Hydrochloride',
        strength: '500mg',
        form: 'Tablet',
        dosage: '1 tablet',
        frequency: 'Twice daily (BD)',
        duration: '30 days',
        quantityPrescribed: 60,
        quantityDispensed: 60,
        itemStatus: 'dispensed',
        instructions: 'Take with or immediately after meals'
      }
    ],
    auditTrail: [
      {
        modifiedAt: '2026-11-15T11:00:00.000Z',
        action: 'created',
        reason: 'Monthly maintenance prescription'
      }
    ],
    dispensingHistory: [
      {
        dispensedAt: '2026-11-15T11:45:00.000Z',
        pharmacistId: '654c00021b4e2d001a23ba02',
        pharmacistName: 'Pharm. Sarah Boateng',
        notes: 'Full 30-day refill dispensed and counselled on adherence.',
        itemsDispensed: [
          { medicineId: '654c09ef1b4e2d001a23ba59', dispensedQuantity: 30, batchNumber: 'AML-2026-88' },
          { medicineId: '654c09ef1b4e2d001a23ba48', dispensedQuantity: 60, batchNumber: 'MET-2026-12' }
        ]
      }
    ]
  }
];

// Helper to access persistent local store
const getLocalPrescriptions = () => {
  const stored = localStorage.getItem('ccis_prescriptions');
  if (!stored) {
    localStorage.setItem('ccis_prescriptions', JSON.stringify(INITIAL_PRESCRIPTIONS));
    return INITIAL_PRESCRIPTIONS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_PRESCRIPTIONS;
  }
};

const saveLocalPrescriptions = (list) => {
  localStorage.setItem('ccis_prescriptions', JSON.stringify(list));
};

export const prescriptionService = {
  // 1. Get Dashboard statistics
  async getDashboardStats() {
    try {
      const res = await fetch(`${API_BASE}/dashboard-stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('ccis_jwt') || 'mock'}` }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Fallback to local store computation
    }

    const list = getLocalPrescriptions();
    return {
      total: list.filter((p) => p.status !== 'cancelled').length,
      pending: list.filter((p) => p.status === 'pending').length,
      partiallyDispensed: list.filter((p) => p.status === 'partially_dispensed').length,
      fulfilled: list.filter((p) => p.status === 'fulfilled').length,
      pendingBackorder: list.filter((p) => p.status === 'pending_backorder').length,
      createdToday: list.length,
      recentPrescriptions: list.slice(0, 5)
    };
  },

  // 2. Get list of prescriptions with filters
  async getPrescriptions({ status, search, patientId } = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (status) queryParams.set('status', status);
      if (search) queryParams.set('search', search);
      if (patientId) queryParams.set('patientId', patientId);

      const res = await fetch(`${API_BASE}?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('ccis_jwt') || 'mock'}` }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Fallback
    }

    let list = getLocalPrescriptions();
    if (status) {
      list = list.filter((p) => p.status === status);
    }
    if (patientId) {
      list = list.filter((p) => p.patientId === patientId);
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.prescriptionNumber.toLowerCase().includes(s) ||
          p.patientName.toLowerCase().includes(s) ||
          p.patientIdentifier.toLowerCase().includes(s)
      );
    }
    return list;
  },

  // 3. Get single prescription by ID
  async getPrescriptionById(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('ccis_jwt') || 'mock'}` }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Fallback
    }

    const list = getLocalPrescriptions();
    const found = list.find((p) => p._id === id || p.prescriptionNumber === id);
    if (!found) throw new Error('Prescription record not found.');
    return found;
  },

  // 4. Create new prescription (Doctor only)
  async createPrescription(payload) {
    try {
      const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ccis_jwt') || 'mock'}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      // Fallback
    }

    const list = getLocalPrescriptions();
    const newSeq = String(list.length + 1).padStart(4, '0');
    const newRx = {
      _id: 'rx_' + Date.now(),
      prescriptionNumber: `RX-202611-${newSeq}`,
      patientId: payload.patientId,
      patientName: payload.patientName || 'Patient Kofi',
      patientIdentifier: payload.patientIdentifier || 'STU-2024-001',
      doctorId: payload.doctorId || '654c00011b4e2d001a23ba01',
      doctorName: payload.doctorName || 'Dr. John Mensah, MD',
      consultationId: payload.consultationId || null,
      prescriptionDate: new Date().toISOString(),
      status: 'pending',
      clinicalDiagnosis: payload.clinicalDiagnosis || '',
      generalInstructions: payload.generalInstructions || '',
      isControlledMedication: Boolean(payload.isControlledMedication),
      items: payload.items.map((i, idx) => ({
        ...i,
        _id: 'item_' + Date.now() + '_' + idx,
        quantityDispensed: 0,
        itemStatus: 'pending'
      })),
      auditTrail: [
        {
          modifiedAt: new Date().toISOString(),
          action: 'created',
          reason: 'Initial consultation prescription created'
        }
      ],
      dispensingHistory: []
    };

    list.unshift(newRx);
    saveLocalPrescriptions(list);
    return newRx;
  },

  // 5. Update prescription before dispensing (Doctor only)
  async updatePrescription(id, payload) {
    const list = getLocalPrescriptions();
    const index = list.findIndex((p) => p._id === id);
    if (index === -1) throw new Error('Prescription not found.');

    if (list[index].status !== 'pending') {
      throw new Error(
        `Prescription cannot be edited. Status is '${list[index].status}'. Changes locked after pharmacy begins dispensing.`
      );
    }

    list[index] = {
      ...list[index],
      clinicalDiagnosis: payload.clinicalDiagnosis ?? list[index].clinicalDiagnosis,
      generalInstructions: payload.generalInstructions ?? list[index].generalInstructions,
      items: payload.items
        ? payload.items.map((i) => ({ ...i, quantityDispensed: 0, itemStatus: 'pending' }))
        : list[index].items,
      auditTrail: [
        ...list[index].auditTrail,
        {
          modifiedAt: new Date().toISOString(),
          action: 'updated_before_dispense',
          reason: payload.reason || 'Doctor adjusted prescription'
        }
      ]
    };

    saveLocalPrescriptions(list);
    return list[index];
  },

  // 6. Pharmacy Dispensing Handoff (Madam Sarah's Module)
  async updateDispenseStatus(id, { status, dispensingNotes, itemsDispensed, pharmacistName }) {
    const list = getLocalPrescriptions();
    const index = list.findIndex((p) => p._id === id);
    if (index === -1) throw new Error('Prescription not found.');

    const rx = list[index];

    // Check false fulfillment
    if (status === 'fulfilled') {
      const allDone = rx.items.every((item) => {
        const update = itemsDispensed.find((di) => di.medicineId === item.medicineId);
        const qty = update ? update.quantityDispensed : item.quantityDispensed;
        return qty >= item.quantityPrescribed;
      });

      if (!allDone) {
        throw new Error('Integrity rule: Cannot mark prescription as fulfilled when items remain pending or backordered.');
      }
    }

    // Apply updates to items
    rx.items = rx.items.map((item) => {
      const match = itemsDispensed.find((di) => di.medicineId === item.medicineId);
      if (match) {
        return {
          ...item,
          quantityDispensed: match.quantityDispensed,
          itemStatus:
            match.quantityDispensed >= item.quantityPrescribed
              ? 'dispensed'
              : match.itemStatus === 'backordered'
              ? 'backordered'
              : match.quantityDispensed > 0
              ? 'partially_dispensed'
              : 'pending',
          batchNumber: match.batchNumber || item.batchNumber
        };
      }
      return item;
    });

    rx.status = status;
    rx.dispensingHistory.push({
      dispensedAt: new Date().toISOString(),
      pharmacistName: pharmacistName || 'Pharm. Sarah Boateng',
      notes: dispensingNotes || '',
      itemsDispensed
    });

    rx.auditTrail.push({
      modifiedAt: new Date().toISOString(),
      action: 'dispense_recorded',
      reason: `Dispensed status transitioned to '${status}'. ${dispensingNotes || ''}`
    });

    saveLocalPrescriptions(list);
    return rx;
  },

  // 7. Get shared medicine catalogue
  async getMedicineCatalogue() {
    return INITIAL_MEDICINE_CATALOGUE;
  }
};
