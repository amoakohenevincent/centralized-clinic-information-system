const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

let mongoServer;

const JWT_SECRET = process.env.JWT_SECRET || 'ccis_shared_jwt_secret_university_clinic_2026';

/**
 * Connect to in-memory database before all tests
 */
const connectTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (err) {
    console.warn('[Test DB] MongoMemoryServer fallback to local test DB:', err.message);
    const fallbackUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ccis_test_db';
    await mongoose.connect(fallbackUri);
  }
};

/**
 * Clear collections between test runs
 */
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Disconnect and stop database after tests
 */
const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Generate test JWT token for specific role
 */
const generateTestToken = (userPayload = {}) => {
  const payload = {
    id: userPayload._id || new mongoose.Types.ObjectId(),
    username: userPayload.username || 'test_doctor',
    role: userPayload.role || 'doctor',
    firstName: userPayload.firstName || 'Sarah',
    lastName: userPayload.lastName || 'Jenkins',
    email: userPayload.email || 'dr.jenkins@clinic.university.edu',
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

module.exports = {
  connectTestDB,
  clearTestDB,
  closeTestDB,
  generateTestToken,
};

