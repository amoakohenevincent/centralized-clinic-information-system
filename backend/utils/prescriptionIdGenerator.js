const Prescription = require('../models/Prescription');

/**
 * Generates a readable, sequential prescription number in the format: RX-YYYYMM-XXXX
 * Example: RX-202611-0001
 * Uses current year, month, and month-scoped counter to guarantee uniqueness.
 */
async function generatePrescriptionNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `RX-${year}${month}`;

  // Find the highest sequence number for the current month
  const regex = new RegExp(`^${prefix}-\\d{4}$`);
  const latestPrescription = await Prescription.findOne({
    prescriptionNumber: { $regex: regex }
  })
    .sort({ prescriptionNumber: -1 })
    .select('prescriptionNumber')
    .lean();

  let nextSequence = 1;
  if (latestPrescription && latestPrescription.prescriptionNumber) {
    const parts = latestPrescription.prescriptionNumber.split('-');
    if (parts.length === 3) {
      const currentSeq = parseInt(parts[2], 10);
      if (!isNaN(currentSeq)) {
        nextSequence = currentSeq + 1;
      }
    }
  }

  const formattedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}-${formattedSequence}`;
}

module.exports = {
  generatePrescriptionNumber
};
