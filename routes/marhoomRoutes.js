import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Marhoom from '../models/Marhoom.js';
import Stats from '../models/Stats.js';

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Cloudinary Storage Setup
// marhoomeinRoutes.js mein ye confirm karein
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 'diskStorage' ki jagah memoryStorage use karein agar file upload error de raha hai
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'khayyan_portal',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => Date.now().toString(),
  },
});

const upload = multer({ storage: storage });

const upload = multer({ storage: storage });

// --- MARHOOMEIN ROUTES ---

// 1. POST API: Cloudinary ke saath naya record
Router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, fatherName, wand, dateOfDemise, dayOfWeek } = req.body;
    
    // Check karein ke file aayi hai ya nahi
    const imagePath = req.file ? req.file.path : ""; 
    
    console.log("Saving data:", { name, fatherName, imagePath }); // Log check karne ke liye

    const newMarhoom = new Marhoom({
      name, 
      fatherName, 
      wand, 
      dateOfDemise, 
      dayOfWeek,
      imageName: imagePath 
    });

    const savedMarhoom = await newMarhoom.save();
    res.status(201).json({ success: true, data: savedMarhoom });
  } catch (error) {
    console.error("Upload error details:", error); // Yahan error ki asal wajah print hogi
    res.status(500).json({ success: false, message: error.message });
  }
});
// 2. GET API: All records
router.get('/all', async (req, res) => {
  try {
    const records = await Marhoom.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. DELETE API
router.delete('/delete/:id', async (req, res) => {
  try {
    await Marhoom.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Record delete ho gaya!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. PUT API: Update record
router.put('/update/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fatherName, wand, dateOfDemise, dayOfWeek } = req.body;
    
    const updateData = { name, fatherName, wand, dateOfDemise, dayOfWeek };
    if (req.file) updateData.imageName = req.file.path;

    const updatedPerson = await Marhoom.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ success: true, data: updatedPerson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Stats Routes (Ye wese hi rahengi)
router.get('/stats/all', async (req, res) => {
  let stats = await Stats.findOne();
  if (!stats) stats = await Stats.create({ familiesCount: "120+", shajraCount: "50+" });
  res.json({ success: true, data: stats });
});

router.put('/stats/update', async (req, res) => {
  const { familiesCount, shajraCount } = req.body;
  let stats = await Stats.findOne();
  if (stats) {
    stats.familiesCount = familiesCount;
    stats.shajraCount = shajraCount;
    await stats.save();
  } else {
    stats = await Stats.create({ familiesCount, shajraCount });
  }
  res.json({ success: true, data: stats });
});

export default router;