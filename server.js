import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import marhoomRoutes from './routes/marhoomRoutes.js'
import announcementRoutes from './routes/announcements.js'



// Configure dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
// Server.js mein purane app.use(cors()) ki jagah yeh lagayein:
app.use(cors({
    origin: 'http://khayyan-portal-backend.vercel.app', // Aapke frontend ka exact URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use('/api/marhoomein',marhoomRoutes);
// Images ko publicly accessible banane ke liye

// Baki routes ke sath ise register karein
app.use('/api/announcements', announcementRoutes);


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Images folder ko absolute path se serve karne ke liye
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection Logic
const mongoURI = process.env.MONGO_URI || "";

if (mongoURI) {
  mongoose.connect(mongoURI)
    .then(() => console.log('🍃 MongoDB Database Connected Successfully!'))
    .catch((err) => console.error(`❌ Database Connection Error: ${err.message}`));
} else {
  console.log('⚠️ Warning: MONGO_URI nahi mila. Abhi database connected nahi hai.');
}

// Base Testing Route
app.get('/', (req, res) => {
  res.send('Khayyan Memorial Portal Backend is Running Successfully!');
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});