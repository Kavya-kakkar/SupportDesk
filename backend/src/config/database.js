const mongoose = require('mongoose');

const connectDB = async () => {
  const uri =
    process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/supportdesk_test'
      : process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/supportdesk';

  try {
    await mongoose.connect(uri);
    console.log(`[MongoDB] Successfully connected to database: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`[MongoDB] Connection error to ${uri}:`, err.message);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[MongoDB] Disconnected successfully');
  } catch (err) {
    console.error('[MongoDB] Error during disconnection:', err);
  }
};

module.exports = { connectDB, disconnectDB };
