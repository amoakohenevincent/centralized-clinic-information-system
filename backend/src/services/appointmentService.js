const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const { ApiError } = require("../errors");

const ACTIVE_STATUSES = ["booked", "checked_in", "in_consultation"];
const STATUS_TRANSITIONS = {
  booked: ["checked_in", "cancelled", "no_show"],
  checked_in: ["in_consultation", "cancelled"],
  in_consultation: ["completed"],
  completed: [],
  cancelled: [],
  no_show: []
};

function parseDate(value, field) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw new ApiError(400, "INVALID_DATE", `${field} must be a valid ISO-8601 date.`);
  }
  return date;
}

async function resolvePatient(user, requestedPatientId) {
  if (user.role === "patient") {
    const patient = await Patient.findOne({ userId: user.id });
    if (!patient) throw new ApiError(404, "PATIENT_NOT_FOUND", "Patient profile was not found.");
    if (requestedPatientId && String(patient._id) !== String(requestedPatientId)) {
      throw new ApiError(403, "FORBIDDEN", "Patients can only book appointments for themselves.");
    }
    return patient;
  }

  if (!requestedPatientId) {
    throw new ApiError(400, "PATIENT_REQUIRED", "A patientId is required when booking for someone else.");
  }
  const patient = await Patient.findById(requestedPatientId);
  if (!patient) throw new ApiError(404, "PATIENT_NOT_FOUND", "Patient profile was not found.");
  return patient;
}

async function getAvailability({ doctorId, from, to }, availabilityProvider) {
  if (!availabilityProvider || typeof availabilityProvider.getSlots !== "function") {
    throw new ApiError(503, "SCHEDULING_UNAVAILABLE", "Clinician availability is not configured.");
  }
  if (!doctorId) throw new ApiError(400, "DOCTOR_REQUIRED", "doctorId is required.");

  const startsAt = parseDate(from, "from");
  const endsAt = parseDate(to, "to");
  if (endsAt <= startsAt) throw new ApiError(400, "INVALID_RANGE", "to must be after from.");

  const slots = await availabilityProvider.getSlots({ doctorId, from: startsAt, to: endsAt });
  const booked = await Appointment.find({
    doctorId,
    startsAt: { $gte: startsAt, $lt: endsAt },
    status: { $in: ACTIVE_STATUSES }
  }).select("startsAt");
  const bookedStarts = new Set(booked.map((item) => item.startsAt.toISOString()));

  return slots.filter((slot) => !bookedStarts.has(new Date(slot.startsAt).toISOString()));
}

async function getDoctors(availabilityProvider) {
  if (!availabilityProvider || typeof availabilityProvider.getDoctors !== "function") {
    throw new ApiError(503, "CLINICIANS_UNAVAILABLE", "The clinician directory is not configured.");
  }
  return availabilityProvider.getDoctors();
}

async function create(user, body, availabilityProvider) {
  const patient = await resolvePatient(user, body.patientId);
  if (!body.doctorId) throw new ApiError(400, "DOCTOR_REQUIRED", "doctorId is required.");

  const startsAt = parseDate(body.startsAt, "startsAt");
  if (startsAt <= new Date()) {
    throw new ApiError(400, "PAST_APPOINTMENT", "Appointments must be booked for a future time.");
  }
  const [slot] = await getAvailability(
    {
      doctorId: body.doctorId,
      from: startsAt.toISOString(),
      to: new Date(startsAt.getTime() + 1).toISOString()
    },
    availabilityProvider
  );
  if (!slot || new Date(slot.startsAt).getTime() !== startsAt.getTime()) {
    throw new ApiError(409, "SLOT_UNAVAILABLE", "The selected appointment slot is not available.");
  }

  const endsAt = parseDate(slot.endsAt, "slot.endsAt");
  if (endsAt <= startsAt) {
    throw new ApiError(502, "INVALID_SCHEDULE_SLOT", "The scheduling service returned an invalid slot.");
  }

  return Appointment.create({
    patientId: patient._id,
    doctorId: body.doctorId,
    startsAt,
    endsAt,
    createdBy: user.id,
    source: user.role === "receptionist" ? "receptionist" : "patient"
  });
}

async function listForPatient(userId) {
  const patient = await Patient.findOne({ userId });
  if (!patient) throw new ApiError(404, "PATIENT_NOT_FOUND", "Patient profile was not found.");
  return Appointment.find({ patientId: patient._id }).sort({ startsAt: -1 }).limit(100);
}

async function listSchedule({ from, to, doctorId }) {
  const startsAt = parseDate(from, "from");
  const endsAt = parseDate(to, "to");
  if (endsAt <= startsAt) throw new ApiError(400, "INVALID_RANGE", "to must be after from.");
  const filter = { startsAt: { $gte: startsAt, $lt: endsAt } };
  if (doctorId) filter.doctorId = doctorId;
  return Appointment.find(filter)
    .sort({ startsAt: 1 })
    .populate("patientId", "patientNumber legalName preferredName phone");
}

async function getById(id) {
  const appointment = await Appointment.findById(id).populate(
    "patientId",
    "patientNumber legalName preferredName phone"
  );
  if (!appointment) throw new ApiError(404, "APPOINTMENT_NOT_FOUND", "Appointment was not found.");
  return appointment;
}

async function cancel(id, user, reason) {
  const appointment = await Appointment.findById(id);
  if (!appointment) throw new ApiError(404, "APPOINTMENT_NOT_FOUND", "Appointment was not found.");
  if (user.role === "patient") {
    const patient = await Patient.findOne({ userId: user.id });
    if (!patient || String(appointment.patientId) !== String(patient._id)) {
      throw new ApiError(403, "FORBIDDEN", "You can only cancel your own appointments.");
    }
    if (appointment.status !== "booked" || appointment.startsAt <= new Date()) {
      throw new ApiError(409, "CANCELLATION_NOT_ALLOWED", "This appointment can no longer be cancelled.");
    }
  }
  if (!STATUS_TRANSITIONS[appointment.status].includes("cancelled")) {
    throw new ApiError(409, "INVALID_STATUS_TRANSITION", "This appointment cannot be cancelled in its current status.");
  }
  appointment.status = "cancelled";
  if (reason) appointment.cancellationReason = String(reason).trim().slice(0, 500);
  await appointment.save();
  return appointment;
}

async function updateStatus(id, nextStatus) {
  const appointment = await Appointment.findById(id);
  if (!appointment) throw new ApiError(404, "APPOINTMENT_NOT_FOUND", "Appointment was not found.");
  if (!STATUS_TRANSITIONS[appointment.status].includes(nextStatus)) {
    throw new ApiError(409, "INVALID_STATUS_TRANSITION", "The requested status transition is not allowed.");
  }
  appointment.status = nextStatus;
  await appointment.save();
  return appointment;
}

async function isOwnedBy(id, userId) {
  const patient = await Patient.findOne({ userId });
  if (!patient) return false;
  return Boolean(await Appointment.exists({ _id: id, patientId: patient._id }));
}

module.exports = {
  getDoctors,
  getAvailability,
  create,
  listForPatient,
  listSchedule,
  getById,
  cancel,
  updateStatus,
  isOwnedBy
};
