const express = require("express");
const appointments = require("../services/appointmentService");
const { requireRole } = require("../middleware/authz");
const { ApiError } = require("../errors");

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

const router = express.Router();

function validateId(value) {
  if (!/^[a-f\d]{24}$/i.test(value)) {
    throw new ApiError(400, "INVALID_APPOINTMENT_ID", "appointmentId must be a valid identifier.");
  }
}

router.get("/doctors", requireRole("patient", "receptionist"), asyncRoute(async (req, res) => {
  const data = await appointments.getDoctors(req.app.locals.availabilityProvider);
  res.json({ data });
}));

router.get("/availability", requireRole("patient", "receptionist"), asyncRoute(async (req, res) => {
  const data = await appointments.getAvailability(req.query, req.app.locals.availabilityProvider);
  res.json({ data });
}));

router.post("/", requireRole("patient", "receptionist"), asyncRoute(async (req, res) => {
  const appointment = await appointments.create(req.user, req.body, req.app.locals.availabilityProvider);
  const notifications = await dispatchNotifications(appointment, req.app.locals.notificationProvider);
  res.status(201).json({ data: { appointment, notifications } });
}));

router.get("/mine", requireRole("patient"), asyncRoute(async (req, res) => {
  const data = await appointments.listForPatient(req.user.id);
  res.json({ data });
}));

router.get("/schedule", requireRole("receptionist"), asyncRoute(async (req, res) => {
  const data = await appointments.listSchedule(req.query);
  res.json({ data });
}));

router.get("/:appointmentId", requireRole("patient", "receptionist"), asyncRoute(async (req, res) => {
  validateId(req.params.appointmentId);
  const appointment = await appointments.getById(req.params.appointmentId);
  if (
    req.user.role === "patient" &&
    !(await appointments.isOwnedBy(appointment._id, req.user.id))
  ) {
    throw new ApiError(403, "FORBIDDEN", "You can only view your own appointments.");
  }
  res.json({ data: appointment });
}));

router.patch("/:appointmentId/cancel", requireRole("patient", "receptionist"), asyncRoute(async (req, res) => {
  validateId(req.params.appointmentId);
  const data = await appointments.cancel(req.params.appointmentId, req.user, req.body.reason);
  res.json({ data });
}));

router.patch("/:appointmentId/status", requireRole("receptionist"), asyncRoute(async (req, res) => {
  validateId(req.params.appointmentId);
  const data = await appointments.updateStatus(req.params.appointmentId, req.body.status);
  
  if (req.body.status === "checked_in" && req.app.locals.notificationProvider?.sendAppointmentCheckIn) {
    req.app.locals.notificationProvider.sendAppointmentCheckIn(data).catch((e) =>
      console.warn("[EXTERNAL SMS GATEWAY] Check-in notification error:", e.message)
    );
  }
  
  res.json({ data });
}));

module.exports = router;

async function dispatchNotifications(appointment, provider) {
  const result = {};
  const tasks = [
    ["confirmation", "sendConfirmation"],
    ["reminder", "scheduleReminder"]
  ];

  for (const [kind, method] of tasks) {
    if (!provider || typeof provider[method] !== "function") {
      result[kind] = "not_configured";
      continue;
    }

    try {
      const delivery = await provider[method](appointment);
      result[kind] = ["sent", "queued", "failed"].includes(delivery?.status)
        ? delivery.status
        : "unknown";
    } catch (error) {
      console.error(`Appointment ${kind} notification failed:`, error.message);
      result[kind] = "failed";
    }
  }

  return result;
}
