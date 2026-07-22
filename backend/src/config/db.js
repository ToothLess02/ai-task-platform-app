const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_task_db';
    await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected to database successfully`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
