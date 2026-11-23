const express = require("express");
const cors = require("cors");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const { errorHandler, ApiError } = require("./errors");

function createApp({ authenticate, availabilityProvider, notificationProvider, corsOrigin } = {}) {
  if (typeof authenticate !== "function") {
    throw new TypeError("createApp requires the shared authentication middleware.");
  }

  const app = express();
  app.use(cors({ origin: corsOrigin || "http://localhost:5173" }));
  app.use(express.json({ limit: "32kb" }));
  app.get("/api/health", (req, res) => res.json({ data: { status: "ok" } }));
  app.use((req, res, next) => {
    Promise.resolve(authenticate(req, res, next)).catch(next);
  });
  app.use((req, res, next) => {
    if (!req.user || typeof req.user.id !== "string" || typeof req.user.role !== "string") {
      return next(new ApiError(401, "UNAUTHENTICATED", "Sign-in is required."));
    }
    return next();
  });
  app.locals.availabilityProvider = availabilityProvider;
  app.locals.notificationProvider = notificationProvider;

  app.use("/api/patients", patientRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use((req, res, next) => next(new ApiError(404, "NOT_FOUND", "Route was not found.")));
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

