const express = require("express");
const patients = require("../services/patientService");
const { requireRole } = require("../middleware/authz");
const { ApiError } = require("../errors");

function validateBody(allowedFields, requireAtLeastOne = false) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return next(new ApiError(400, "INVALID_BODY", "Request body must be a JSON object."));
    }

    const unsupported = Object.keys(req.body).filter((field) => !allowedFields.includes(field));
    if (unsupported.length) {
      return next(new ApiError(
        400,
        "UNSUPPORTED_FIELDS",
        "Request contains fields that cannot be changed through this endpoint.",
        { fields: unsupported }
      ));
    }

    if (requireAtLeastOne && Object.keys(req.body).length === 0) {
      return next(new ApiError(400, "EMPTY_UPDATE", "Provide at least one permitted field to update."));
    }

    return next();
  };
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

const router = express.Router();
const PROFILE_FIELDS = [
  "legalName",
  "preferredName",
  "dateOfBirth",
  "phone",
  "address",
  "emergencyContact"
];
const SELF_EDITABLE_FIELDS = ["preferredName", "phone", "address", "emergencyContact"];

router.post(
  "/me",
  requireRole("patient"),
  validateBody(PROFILE_FIELDS),
  asyncRoute(async (req, res) => {
    const patient = await patients.createForUser(req.user.id, req.body);
    res.status(201).json({ data: patient });
  })
);

router.get("/me", requireRole("patient"), asyncRoute(async (req, res) => {
  res.json({ data: await patients.getForUser(req.user.id) });
}));

router.patch(
  "/me",
  requireRole("patient"),
  validateBody(SELF_EDITABLE_FIELDS, true),
  asyncRoute(async (req, res) => {
    res.json({ data: await patients.updateForUser(req.user.id, req.body) });
  })
);

router.post(
  "/",
  requireRole("receptionist"),
  validateBody(PROFILE_FIELDS),
  asyncRoute(async (req, res) => {
    res.status(201).json({ data: await patients.createWalkIn(req.body) });
  })
);

router.get("/", requireRole("receptionist"), asyncRoute(async (req, res) => {
  const data = await patients.search(req.query.search);
  res.json({ data });
}));

router.get("/:patientId", requireRole("receptionist"), asyncRoute(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.patientId)) {
    throw new ApiError(400, "INVALID_PATIENT_ID", "patientId must be a valid identifier.");
  }
  res.json({ data: await patients.getById(req.params.patientId) });
}));

module.exports = router;
