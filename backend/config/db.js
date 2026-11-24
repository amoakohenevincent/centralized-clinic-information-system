const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ccis_db', {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[CCIS-Clinical] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[CCIS-Clinical] MongoDB connection notice: ${error.message}`);
    console.warn('[CCIS-Clinical] Server running in offline/in-memory fallback mode.');
    return null;
  }
};

module.exports = connectDB;

