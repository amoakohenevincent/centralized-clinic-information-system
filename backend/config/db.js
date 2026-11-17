const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ccis_db');
    console.log(`[CCIS Prescription] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[CCIS Prescription] Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
