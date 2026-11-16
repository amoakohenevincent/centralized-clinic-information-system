require("dotenv").config();
const path = require("node:path");
const mongoose = require("mongoose");
const { createApp } = require("./app");

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured.");
  }
  if (!process.env.SHARED_AUTH_MODULE) {
    throw new Error("SHARED_AUTH_MODULE must point to the team's authentication adapter.");
  }

  const authModulePath = path.resolve(process.cwd(), process.env.SHARED_AUTH_MODULE);
  const authModule = require(authModulePath);
  if (typeof authModule.authenticate !== "function") {
    throw new TypeError("The shared auth adapter must export authenticate(req, res, next).");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const app = createApp({
    authenticate: authModule.authenticate,
    availabilityProvider: authModule.availabilityProvider,
    notificationProvider: authModule.notificationProvider,
    corsOrigin: process.env.CORS_ORIGIN
  });
  const port = Number(process.env.PORT || 4000);
  const server = app.listen(port, () => console.log(`Patient and appointment API listening on ${port}`));

  const shutdown = async () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
