import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import marhoomRoutes from './routes/marhoomRoutes.js';
import announcementRoutes from './routes/announcements.js';

// Configure dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares - CORS settings optimized for testing and Vercel production
app.use(cors({
    origin: "*", // Testing ke liye temporary sab allowed kar diya taake CORS issue bilkul na aaye
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/marhoomein', marhoomRoutes);
app.use('/api/announcements', announcementRoutes);

// MongoDB Connection Logic with Serverless Optimization
const mongoURI = process.env.MONGO_URI || "";

if (mongoURI) {
  mongoose.connect(mongoURI, {
    bufferCommands: false, // 🔥 SERVERLESS TIMEOUTS SE BACHNE KE LIYE YEH SABSE ZAROORI HAI
  })
    .then(() => console.log('🍃 MongoDB Database Connected Successfully!'))
    .catch((err) => console.error(`❌ Database Connection Error: ${err.message}`));
} else {
  console.log('⚠️ Warning: MONGO_URI nahi mila.');
}

// Base Testing Route
app.get('/', (req, res) => {
  res.send('Khayyan Memorial Portal Backend is Running Successfully with Cloudinary!');
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});