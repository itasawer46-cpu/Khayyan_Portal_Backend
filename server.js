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

// MongoDB Connection Logic with Hardcoded URI for Serverless Bypass
// Vercel environment variables read nahi kar raha tha, isliye direct string laga di hai.
const mongoURI = "mongodb+srv://husnaingill565758_db_user:KhayyanPass123@cluster0.sp6ysnv.mongodb.net/Khayyan_portal?appName=Cluster0";

mongoose.connect(mongoURI, {
  bufferCommands: false, // 🔥 SERVERLESS TIMEOUTS SE BACHNE KE LIYE YEH SABSE ZAROORI HAI
})
  .then(() => console.log('🍃 MongoDB Database Connected Successfully!'))
  .catch((err) => console.error(`❌ Database Connection Error: ${err.message}`));

// Base Testing Route
app.get('/', (req, res) => {
  res.send('Khayyan Memorial Portal Backend is Running Successfully with Cloudinary!');
});

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});