const Patient = require("../models/Patient");
const { ApiError } = require("../errors");

const PROFILE_FIELDS = ["legalName", "preferredName", "dateOfBirth", "phone", "address", "emergencyContact"];
const SELF_EDITABLE_FIELDS = ["preferredName", "phone", "address", "emergencyContact"];

function pick(source, fields) {
  return fields.reduce((result, field) => {
    if (source[field] !== undefined) result[field] = source[field];
    return result;
  }, {});
}

async function createForUser(userId, body) {
  const profile = pick(body, PROFILE_FIELDS);
  return Patient.create({ ...profile, userId });
}

async function createWalkIn(body) {
  const profile = pick(body, PROFILE_FIELDS);
  return Patient.create(profile);
}

async function getForUser(userId) {
  const patient = await Patient.findOne({ userId });
  if (!patient) throw new ApiError(404, "PATIENT_NOT_FOUND", "Patient profile was not found.");
  return patient;
}

async function updateForUser(userId, body) {
  const patient = await Patient.findOneAndUpdate(
    { userId },
    { $set: pick(body, SELF_EDITABLE_FIELDS) },
    { new: true, runValidators: true }
  );
  if (!patient) throw new ApiError(404, "PATIENT_NOT_FOUND", "Patient profile was not found.");
  return patient;
}

async function search(query) {
  const searchTerm = String(query || "").trim();
  if (!searchTerm) return [];

  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return Patient.find({
    $or: [
      { patientNumber: new RegExp(escaped, "i") },
      { legalName: new RegExp(escaped, "i") },
      { phone: new RegExp(escaped, "i") }
    ]
  }).select("patientNumber legalName preferredName dateOfBirth phone")
    .sort({ legalName: 1 })
    .limit(25);
}

async function getById(id) {
  const patient = await Patient.findById(id)
    .select("patientNumber legalName preferredName dateOfBirth phone");
  if (!patient) throw new ApiError(404, "PATIENT_NOT_FOUND", "Patient profile was not found.");
  return patient;
}

module.exports = {
  createForUser,
  createWalkIn,
  getForUser,
  updateForUser,
  search,
  getById
};
