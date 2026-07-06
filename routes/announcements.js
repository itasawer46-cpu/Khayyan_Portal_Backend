import express from 'express';
import multer from 'multer';
import path from 'path';
import Announcement from '../models/Announcement.js';

const router = express.Router();

// 1. Multer Disk Storage Configuration (Audio aur Image dono 'uploads/' mein jayengi)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

// 🔥 SAFE FILE FILTER: Audio aur Images ke mimetypes ko handle karne ke liye secure logic
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type! Only image files are allowed.'), false);
    }
  } else if (file.fieldname === 'audio') {
    if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(mp3|wav|m4a|mpeg)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio type! Only audio files (.mp3, .wav, .m4a) are allowed.'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit taake barri audio files par crash na ho
});

// 🔥 Multer Configuration for Multiple Fields (Max 1 image aur 1 audio field)
const cpUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]);
// 2. Nayi Announcement Add Karne Ka Route (With Image & Audio Support) 🎤
router.post('/add', (req, res, next) => {
  // Custom Multer error handling taake error explicit pata chale
  cpUpload(req, res, function (err) {
    if (err) {
      console.error("Multer Upload Error:", err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { type, title, date, details } = req.body;

    let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (type === 'Vafat') {
      badgeClass = 'bg-red-50 text-red-700 border-red-200';
    } else if (type === 'Soyem / Qul') {
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    // 🔥 Files handle karein: req.files check karein aur paths nikalein
    const imagePath = req.files && req.files.image ? `/uploads/${req.files.image[0].filename}` : "";
    const audioPath = req.files && req.files.audio ? `/uploads/${req.files.audio[0].filename}` : "";

    const newAnnouncement = new Announcement({
      type,
      title,
      date,
      details,
      badgeClass,
      image: imagePath,
      audio: audioPath 
    });

    await newAnnouncement.save();
    res.json({ success: true, message: "Khabarnama kamyabi se add ho gaya!", data: newAnnouncement });
  } catch (error) {
    console.error("Database Save Error:", error);
    res.status(500).json({ success: false, message: "Server error! Database me save nahi ho saka." });
  }
});


// 3. Saari Announcements Fetch Karne Ka Route
router.get('/all', async (req, res) => {
  try {
    const data = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Fetch karne mein error" });
  }
});


// 4. Announcement Delete Karne Ka Route 🗑️
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.json({ success: true, message: "Khabarnama kamyabi se delete ho gaya!" });
  } catch (error) {
    console.error("Delete karne mein error:", error);
    res.status(500).json({ success: false, message: "Server error! Delete nahi ho saka." });
  }
});


// 5. Announcement Update Karne Ka Route (With Image & Audio Support) ✏️
router.put('/update/:id', (req, res, next) => {
  cpUpload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, date, details } = req.body;
    
    const existingAnnouncement = await Announcement.findById(id);
    if (!existingAnnouncement) {
      return res.status(404).json({ success: false, message: "Khabarnama nahi mila." });
    }

    const imagePath = req.files && req.files.image ? `/uploads/${req.files.image[0].filename}` : existingAnnouncement.image;
    const audioPath = req.files && req.files.audio ? `/uploads/${req.files.audio[0].filename}` : existingAnnouncement.audio;

    let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (type === 'Vafat') {
      badgeClass = 'bg-red-50 text-red-700 border-red-200';
    } else if (type === 'Soyem / Qul') {
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { type, title, date, details, badgeClass, image: imagePath, audio: audioPath },
      { new: true }
    );
    
    res.json({ success: true, data: updatedAnnouncement, message: "Khabarnama kamyabi se update ho gaya!" });
  } catch (error) {
    console.error("Update karne mein error:", error);
    res.status(500).json({ success: false, message: "Server error! Update nahi ho saka." });
  }
});

export default router;