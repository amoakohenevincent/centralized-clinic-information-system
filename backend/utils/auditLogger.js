/**
 * Helper to construct an audit trail entry for controlled prescription changes.
 *
 * @param {Object} params
 * @param {string} params.userId - ObjectId of the user modifying the document
 * @param {string} params.action - Action identifier ('created', 'updated_before_dispense', 'cancelled', 'dispense_recorded')
 * @param {string} [params.reason] - Clinical or operational reason for change
 * @param {Object} [params.previousValues] - Snapshot of prior values
 * @returns {Object} Audit log entry
 */
function createAuditEntry({ userId, action, reason = '', previousValues = null }) {
  return {
    modifiedAt: new Date(),
    modifiedBy: userId,
    action,
    reason,
    previousValues
  };
}

module.exports = {
  createAuditEntry
};
