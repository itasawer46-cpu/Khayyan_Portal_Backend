import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Announcement from '../models/Announcement.js';

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Cloudinary Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'khayyan-portal',
    resource_type: 'auto',
  },
});

const upload = multer({ storage: storage });
const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]);

// POST: Add Announcement
router.post('/add', cpUpload, async (req, res) => {
  try {
    const { type, title, date, details } = req.body;
    
    // Badge Class logic
    let badgeClass = type === 'Vafat' ? 'bg-red-50 text-red-700 border-red-200' : 
                     (type === 'Soyem / Qul' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                     'bg-emerald-50 text-emerald-700 border-emerald-200');

    // Optional Chaining (?.) used to prevent crash if req.files is undefined
    const newAnnouncement = new Announcement({
      type, title, date, details, badgeClass,
      image: req.files?.image ? req.files.image[0].path : "",
      audio: req.files?.audio ? req.files.audio[0].path : ""
    });

    await newAnnouncement.save();
    res.json({ success: true, data: newAnnouncement });
  } catch (error) {
    console.error("Add Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT: Update Announcement
router.put('/update/:id', cpUpload, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, date, details } = req.body;
    
    const existing = await Announcement.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Announcement not found" });
    
    const updatedData = {
      type, title, date, details,
      image: req.files?.image ? req.files.image[0].path : existing.image,
      audio: req.files?.audio ? req.files.audio[0].path : existing.audio,
      badgeClass: type === 'Vafat' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };

    const updated = await Announcement.findByIdAndUpdate(id, updatedData, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Get all
router.get('/all', async (req, res) => {
  try {
    const data = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    console.error("Fetch All Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Delete
router.delete('/delete/:id', async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted successfully!" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;