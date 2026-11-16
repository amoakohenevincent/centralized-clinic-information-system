const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { createApp } = require("../src/app");
const Patient = require("../src/models/Patient");
const Appointment = require("../src/models/Appointment");

let mongo;
let app;
let startsAt;

const patientHeaders = {
  "x-user-id": "patient-account-1",
  "x-user-role": "patient"
};
const receptionistHeaders = {
  "x-user-id": "reception-account-1",
  "x-user-role": "receptionist"
};

function profile(overrides = {}) {
  return {
    legalName: "Jordan Example",
    dateOfBirth: "2001-04-12T00:00:00.000Z",
    phone: "555-0101",
    ...overrides
  };
}

async function registerPatient(headers = patientHeaders) {
  return request(app).post("/api/patients/me").set(headers).send(profile());
}

async function bookPatientAppointment(headers = patientHeaders) {
  return request(app)
    .post("/api/appointments")
    .set(headers)
    .send({ doctorId: "clinician-123", startsAt: startsAt.toISOString() });
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all([Patient.init(), Appointment.init()]);

  const authenticate = (req, res, next) => {
    req.user = {
      id: req.get("x-user-id"),
      role: req.get("x-user-role")
    };
    next();
  };
  const availabilityProvider = {
    getDoctors: async () => [{ id: "clinician-123", name: "Dr. Example" }],
    getSlots: async ({ from, to }) => {
      const start = new Date(from);
      if (startsAt >= start && startsAt < new Date(to)) {
        return [{ startsAt, endsAt: new Date(startsAt.getTime() + 30 * 60 * 1000) }];
      }
      return [];
    }
  };
  app = createApp({ authenticate, availabilityProvider });
});

beforeEach(async () => {
  startsAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await Promise.all([Patient.deleteMany({}), Appointment.deleteMany({})]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("patient and appointment API", () => {
  test("registers a patient profile with a unique patient number", async () => {
    const response = await registerPatient();

    expect(response.status).toBe(201);
    expect(response.body.data.patientNumber).toMatch(/^CCIS-PT-/);
    expect(response.body.data.userId).toBe(patientHeaders["x-user-id"]);
  });

  test("prevents duplicate patient profiles for the same shared account", async () => {
    await registerPatient();
    const response = await registerPatient();

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("DUPLICATE_RECORD");
  });

  test("returns only the signed-in patient's own profile", async () => {
    await registerPatient();
    const response = await request(app).get("/api/patients/me").set(patientHeaders);

    expect(response.status).toBe(200);
    expect(response.body.data.legalName).toBe("Jordan Example");
  });

  test("rejects profile fields the patient is not permitted to edit", async () => {
    await registerPatient();
    const response = await request(app)
      .patch("/api/patients/me")
      .set(patientHeaders)
      .send({ legalName: "Changed Name" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("UNSUPPORTED_FIELDS");
  });

  test("books an appointment and rejects booking the same slot twice", async () => {
    await registerPatient();
    const first = await bookPatientAppointment();
    const second = await bookPatientAppointment();

    expect(first.status).toBe(201);
    expect(first.body.data.appointment.status).toBe("booked");
    expect(first.body.data.notifications).toEqual({
      confirmation: "not_configured",
      reminder: "not_configured"
    });
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe("SLOT_UNAVAILABLE");
  });

  test("prevents concurrent requests from reserving the same slot", async () => {
    await registerPatient();
    const [first, second] = await Promise.all([
      bookPatientAppointment(),
      bookPatientAppointment()
    ]);

    expect([first.status, second.status].sort()).toEqual([201, 409]);
  });

  test("cancels a future appointment and allows the slot to be booked again", async () => {
    await registerPatient();
    const booking = await bookPatientAppointment();
    const cancelled = await request(app)
      .patch(`/api/appointments/${booking.body.data.appointment._id}/cancel`)
      .set(patientHeaders)
      .send({ reason: "Schedule change" });
    const replacement = await bookPatientAppointment();

    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe("cancelled");
    expect(replacement.status).toBe(201);
  });

  test("restricts receptionist patient management routes to receptionists", async () => {
    const forbidden = await request(app).get("/api/patients").set(patientHeaders);
    const walkIn = await request(app).post("/api/patients").set(receptionistHeaders).send(profile());

    expect(forbidden.status).toBe(403);
    expect(walkIn.status).toBe(201);
    expect(walkIn.body.data.userId).toBeUndefined();
  });

  test("does not allow one patient to cancel another patient's appointment", async () => {
    await registerPatient();
    const booking = await bookPatientAppointment();
    const response = await request(app)
      .patch(`/api/appointments/${booking.body.data.appointment._id}/cancel`)
      .set({ "x-user-id": "different-patient", "x-user-role": "patient" })
      .send({});

    expect(response.status).toBe(403);
  });
});
