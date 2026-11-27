const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const { generatePrescriptionNumber } = require('../utils/prescriptionIdGenerator');
const { createAuditEntry } = require('../utils/auditLogger');
const smsService = require('../services/smsService');

/**
 * @desc    Create a new prescription after clinical consultation
 * @route   POST /api/prescriptions
 * @access  Private (Doctor only)
 */
exports.createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      patientIdentifier,
      consultationId,
      clinicalDiagnosis,
      generalInstructions,
      items,
      isControlledMedication
    } = req.body;

    const doctorId = req.user.id;
    const doctorName = req.user.name || 'Dr. ' + (req.user.username || 'Authorized Physician');

    // Verify all medicines exist in the shared catalogue
    const medicineIds = items.map((item) => item.medicineId);
    const existingMedicines = await Medicine.find({ _id: { $in: medicineIds }, isActive: true });

    if (existingMedicines.length !== medicineIds.length) {
      const foundIds = existingMedicines.map((m) => m._id.toString());
      const missingIds = medicineIds.filter((id) => !foundIds.includes(id.toString()));
      return res.status(400).json({
        success: false,
        message: 'One or more selected medicines do not exist or are inactive in the shared pharmacy catalogue.',
        missingMedicineIds: missingIds
      });
    }

    // Generate unique human-readable prescription number
    const prescriptionNumber = await generatePrescriptionNumber();

    // Prepare item subdocuments with pending status
    const preparedItems = items.map((item) => ({
      ...item,
      quantityDispensed: 0,
      itemStatus: 'pending'
    }));

    // Initialize audit trail entry
    const initialAudit = createAuditEntry({
      userId: doctorId,
      action: 'created',
      reason: 'Initial prescription created following clinical consultation'
    });

    const prescription = new Prescription({
      prescriptionNumber,
      patientId,
      patientName: patientName || '',
      patientIdentifier: patientIdentifier || '',
      doctorId,
      doctorName,
      consultationId: consultationId || null,
      prescriptionDate: new Date(),
      clinicalDiagnosis: clinicalDiagnosis || '',
      generalInstructions: generalInstructions || '',
      items: preparedItems,
      status: 'pending',
      isControlledMedication: Boolean(isControlledMedication),
      auditTrail: [initialAudit],
      dispensingHistory: []
    });

    const savedPrescription = await prescription.save();

    return res.status(201).json({
      success: true,
      message: 'Prescription created successfully and transmitted to the pharmacy queue.',
      data: savedPrescription
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred while creating the prescription.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all prescriptions with pagination, filtering, and search
 * @route   GET /api/prescriptions
 * @access  Private (Doctor, Pharmacist, Nurse, Admin)
 */
exports.getAllPrescriptions = async (req, res) => {
  try {
    const {
      status,
      patientId,
      doctorId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (patientId) {
      filter.patientId = patientId;
    }

    if (doctorId) {
      filter.doctorId = doctorId;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { prescriptionNumber: searchRegex },
        { patientName: searchRegex },
        { patientIdentifier: searchRegex },
        { 'items.medicineName': searchRegex }
      ];
    }

    if (startDate || endDate) {
      filter.prescriptionDate = {};
      if (startDate) {
        filter.prescriptionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.prescriptionDate.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, prescriptions] = await Promise.all([
      Prescription.countDocuments(filter),
      Prescription.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve prescriptions.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get dashboard metrics & statistics for Prescription Dashboard
 * @route   GET /api/prescriptions/dashboard-stats
 * @access  Private (Clinical & Pharmacy Staff)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalCount,
      pendingCount,
      partiallyDispensedCount,
      fulfilledCount,
      backorderCount,
      todayCount,
      recentPrescriptions
    ] = await Promise.all([
      Prescription.countDocuments({ status: { $ne: 'cancelled' } }),
      Prescription.countDocuments({ status: 'pending' }),
      Prescription.countDocuments({ status: 'partially_dispensed' }),
      Prescription.countDocuments({ status: 'fulfilled' }),
      Prescription.countDocuments({ status: 'pending_backorder' }),
      Prescription.countDocuments({ createdAt: { $gte: startOfToday } }),
      Prescription.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('prescriptionNumber patientName patientIdentifier doctorName prescriptionDate status items')
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        pending: pendingCount,
        partiallyDispensed: partiallyDispensedCount,
        fulfilled: fulfilledCount,
        pendingBackorder: backorderCount,
        createdToday: todayCount,
        recentPrescriptions
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate prescription statistics.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single prescription by ID
 * @route   GET /api/prescriptions/:id
 * @access  Private (Clinical & Pharmacy Staff)
 */
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error('Error retrieving prescription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve prescription record.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Controlled update of a prescription before dispensing
 * @route   PUT /api/prescriptions/:id
 * @access  Private (Doctor only)
 */
exports.updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, clinicalDiagnosis, generalInstructions, items } = req.body;
    const doctorId = req.user.id;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found.'
      });
    }

    // Inviolable Rule: Controlled updates are ONLY allowed before dispensing commences
    if (prescription.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `Prescription cannot be modified. Current status is '${prescription.status}'. Updates are strictly prohibited once pharmacy dispensing has commenced.`
      });
    }

    // Save previous snapshot for audit trail
    const previousSnapshot = {
      clinicalDiagnosis: prescription.clinicalDiagnosis,
      generalInstructions: prescription.generalInstructions,
      items: prescription.items
    };

    if (clinicalDiagnosis !== undefined) {
      prescription.clinicalDiagnosis = clinicalDiagnosis;
    }

    if (generalInstructions !== undefined) {
      prescription.generalInstructions = generalInstructions;
    }

    if (items && Array.isArray(items)) {
      // Validate any updated medicines
      const medicineIds = items.map((i) => i.medicineId);
      const validMeds = await Medicine.find({ _id: { $in: medicineIds }, isActive: true });
      if (validMeds.length !== medicineIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more updated medicines are invalid or inactive in the catalogue.'
        });
      }

      prescription.items = items.map((item) => ({
        ...item,
        quantityDispensed: 0,
        itemStatus: 'pending'
      }));
    }

    // Append to audit trail
    prescription.auditTrail.push(
      createAuditEntry({
        userId: doctorId,
        action: 'updated_before_dispense',
        reason,
        previousValues: previousSnapshot
      })
    );

    const updatedPrescription = await prescription.save();

    return res.status(200).json({
      success: true,
      message: 'Prescription updated successfully and audit log recorded.',
      data: updatedPrescription
    });
  } catch (error) {
    console.error('Error updating prescription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update prescription.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Cancel a prescription before dispensing
 * @route   PATCH /api/prescriptions/:id/cancel
 * @access  Private (Doctor only)
 */
exports.cancelPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by prescribing physician' } = req.body;
    const doctorId = req.user.id;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found.'
      });
    }

    if (prescription.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `Prescription cannot be cancelled. Current status is '${prescription.status}'. Only pending prescriptions may be cancelled.`
      });
    }

    prescription.status = 'cancelled';
    prescription.auditTrail.push(
      createAuditEntry({
        userId: doctorId,
        action: 'cancelled',
        reason
      })
    );

    await prescription.save();

    return res.status(200).json({
      success: true,
      message: 'Prescription successfully cancelled.',
      data: prescription
    });
  } catch (error) {
    console.error('Error cancelling prescription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel prescription.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Pharmacy Handoff: Record dispensing status from Module 4 (Madam Sarah)
 * @route   PATCH /api/prescriptions/:id/dispense-status
 * @access  Private (Pharmacist only)
 */
exports.updateDispenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, dispensingNotes = '', itemsDispensed } = req.body;
    const pharmacistId = req.user.id;
    const pharmacistName = req.user.name || 'Dispensing Pharmacist';

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found.'
      });
    }

    if (prescription.status === 'cancelled') {
      return res.status(409).json({
        success: false,
        message: 'Cannot dispense items for a cancelled prescription.'
      });
    }

    // Process item-level updates
    const dispensedMap = new Map();
    itemsDispensed.forEach((di) => {
      dispensedMap.set(di.medicineId.toString(), di);
    });

    let allItemsFullyDispensed = true;
    let anyItemHasBackorder = false;
    let totalItemsDispensedCount = 0;

    prescription.items.forEach((item) => {
      const match = dispensedMap.get(item.medicineId.toString());
      if (match) {
        item.quantityDispensed = match.quantityDispensed;
        if (match.batchNumber) {
          item.batchNumber = match.batchNumber;
        }

        if (item.quantityDispensed >= item.quantityPrescribed) {
          item.itemStatus = 'dispensed';
          totalItemsDispensedCount++;
        } else if (item.quantityDispensed > 0) {
          item.itemStatus = 'partially_dispensed';
          allItemsFullyDispensed = false;
        } else if (match.itemStatus === 'backordered') {
          item.itemStatus = 'backordered';
          anyItemHasBackorder = true;
          allItemsFullyDispensed = false;
        } else {
          allItemsFullyDispensed = false;
        }
      } else {
        // Item was not mentioned in this dispensing action
        if (item.quantityDispensed < item.quantityPrescribed) {
          allItemsFullyDispensed = false;
        }
      }
    });

    // INVIOLABLE BUSINESS RULE: Prevent false fulfillment
    // Do not mark a prescription as fulfilled when only some items have been dispensed!
    if (status === 'fulfilled' && !allItemsFullyDispensed) {
      return res.status(422).json({
        success: false,
        message: 'Integrity rule violation: Cannot mark prescription as fulfilled when one or more items have not been completely dispensed or are backordered.',
        details: {
          requestedStatus: status,
          actualState: anyItemHasBackorder ? 'pending_backorder' : 'partially_dispensed'
        }
      });
    }

    // Apply verified overall status
    prescription.status = status;

    // Record dispensing entry in history
    prescription.dispensingHistory.push({
      dispensedAt: new Date(),
      pharmacistId,
      pharmacistName,
      notes: dispensingNotes,
      itemsDispensed: itemsDispensed.map((di) => ({
        medicineId: di.medicineId,
        dispensedQuantity: di.quantityDispensed,
        batchNumber: di.batchNumber || ''
      }))
    });

    // Also append to audit trail
    prescription.auditTrail.push(
      createAuditEntry({
        userId: pharmacistId,
        action: 'dispense_recorded',
        reason: `Dispensing status transitioned to ${status}. ${dispensingNotes}`.trim()
      })
    );

    const updatedPrescription = await prescription.save();

    // Trigger External SMS notification to patient upon fulfillment
    if (status === 'fulfilled') {
      smsService.sendPrescriptionReadyAlert(updatedPrescription).catch((err) =>
        console.warn('[EXTERNAL SMS GATEWAY] Prescription ready notification dispatch failed:', err.message)
      );
    } else if (status === 'partially_dispensed') {
      smsService.sendPrescriptionPartialAlert(updatedPrescription).catch((err) =>
        console.warn('[EXTERNAL SMS GATEWAY] Partial prescription notification dispatch failed:', err.message)
      );
    }

    return res.status(200).json({
      success: true,
      message: `Prescription dispensing status successfully updated to '${status}'.`,
      data: updatedPrescription
    });
  } catch (error) {
    console.error('Error updating dispense status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record dispensing status update.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get complete clinical prescription history for a specific patient
 * @route   GET /api/prescriptions/patient/:patientId
 * @access  Private (Clinical Staff)
 */
exports.getPatientPrescriptionHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patientId })
      .sort({ prescriptionDate: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      patientId,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching patient prescription history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient prescription history.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
