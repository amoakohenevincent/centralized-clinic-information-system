const Patient = require("../../models/shared/Patient");
const { ApiError } = require("../errors");

const PROFILE_FIELDS = ["legalName", "preferredName", "dateOfBirth", "phone", "address", "emergencyContact", "firstName", "lastName", "phoneNumber", "email", "gender", "bloodGroup", "universityId", "patientType", "department"];
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
      { patientId: new RegExp(escaped, "i") },
      { universityId: new RegExp(escaped, "i") },
      { legalName: new RegExp(escaped, "i") },
      { firstName: new RegExp(escaped, "i") },
      { lastName: new RegExp(escaped, "i") },
      { phone: new RegExp(escaped, "i") },
      { phoneNumber: new RegExp(escaped, "i") },
    ]
  }).sort({ legalName: 1 })
    .limit(25);
}

async function getById(id) {
  const patient = await Patient.findById(id);
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
