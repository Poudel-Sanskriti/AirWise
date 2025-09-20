import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import path from 'path';
import airQualityRoutes from './routes/airQuality';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/air-quality', airQualityRoutes);

app.get('/api/v1/test', (req, res) => {
  res.json({ message: 'AirWise API is running!' });
});

// MongoDB connection (optional for development)
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airwise';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed - running without database');
    console.warn('💡 Install MongoDB or use MongoDB Atlas for full functionality');
    return false;
  }
};

// Start server
const startServer = async () => {
  // Try to connect to MongoDB, but don't fail if it's not available
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 AirWise API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/v1/test`);
    console.log('');
    console.log('🎯 Ready for hackathon development!');
  });
};

startServer().catch(console.error);

export default app;