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

// Middlewares
app.use(cors({
    origin: ["https://khayyan-portal-frontend.vercel.app", "https://khayyan-portal-frontend-4g488bhh2-itasawer46-cpus.vercel.app"], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/marhoomein', marhoomRoutes);
app.use('/api/announcements', announcementRoutes);

// 🔥 UPDATE: Local 'uploads' folder serve karne wala code yahan se hat gaya hai 
// kyunke ab files Cloudinary se aa rahi hain.

// MongoDB Connection Logic
const mongoURI = process.env.MONGO_URI || "";

if (mongoURI) {
  mongoose.connect(mongoURI)
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