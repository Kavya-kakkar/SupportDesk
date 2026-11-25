require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const { seedInitialData } = require('./src/utils/seedData');

// Initialize event service to register listeners
require('./src/services/eventService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed default admin, demo customer, and initial tickets
    await seedInitialData();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`[SupportDesk] Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[SupportDesk] Fatal error during startup:', err);
    process.exit(1);
  }
};

startServer();
