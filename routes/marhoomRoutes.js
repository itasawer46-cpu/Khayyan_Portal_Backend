import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // File System module image delete karne ke liye
import Marhoom from '../models/Marhoom.js';
import Stats from '../models/Stats.js'; // Stats model import

const router = express.Router();

// --- UNIVERSAL MULTER CONFIGURATION FOR ALL IMAGE FORMATS ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 🔥 UNIVERSAL FIX: Ab ye har us file ko allow karega jiske mimetype ke shuru me 'image/' aata ho
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Har qism ki image (png, jpg, jpeg, jfif, webp, bmp, heic) bina error ke accept hogi
  } else {
    cb(new Error('Sirf tasaveer (Images) upload karne ki ijazat hai!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit heavy high-quality pics ke liye
});


// --- MARHOOMEIN ROUTES ---

// 1. POST API: Naya data + Universal Image upload
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, fatherName, wand, dateOfDemise, dayOfWeek } = req.body;
    const imageName = req.file ? req.file.filename : "";

    const newMarhoom = new Marhoom({
      name,
      fatherName,
      wand,
      dateOfDemise,
      dayOfWeek,
      imageName: imageName
    });

    const savedMarhoom = await newMarhoom.save();
    res.status(201).json({ success: true, message: 'Record with image saved successfully!', data: savedMarhoom });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error! Data save nahi hua.', error: error.message });
  }
});

// 2. GET API: Saara data fetch karna
router.get('/all', async (req, res) => {
  try {
    const records = await Marhoom.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Data fetch nahi ho saka.', error: error.message });
  }
});

// 3. DELETE API: Record aur uski image ko urrane ke liye
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Database mein record check karein
    const person = await Marhoom.findById(id);
    if (!person) {
      return res.status(404).json({ success: false, message: "Record nahi mila!" });
    }

    // Server ke 'uploads' folder se image delete karne ka behtar path logic
    if (person.imageName && person.imageName !== 'cover.jpg') {
      const imagePath = path.resolve('uploads', person.imageName);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Asli file bura di
        console.log(`🗑️ File successfully server se saaf ho gayi: ${person.imageName}`);
      } else {
        console.log("⚠️ File server par pehle se maujood nahi thi, bas database se urrayenge.");
      }
    }

    // Database se data remove karna
    await Marhoom.findByIdAndDelete(id);
    
    res.status(200).json({ success: true, message: "Record kamyabi se delete ho gaya!" });
  } catch (error) {
    console.error("Backend Delete Error:", error.message);
    res.status(500).json({ success: false, message: "Server error! Delete nahi ho saka.", error: error.message });
  }
});

// 4. PUT API: Record aur image update karne ke liye (Universal Format Support)
router.put('/update/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, fatherName, wand, dateOfDemise, dayOfWeek } = req.body;

    const person = await Marhoom.findById(id);
    if (!person) {
      return res.status(404).json({ success: false, message: "Record nahi mila!" });
    }

    let updatedData = { name, fatherName, wand, dateOfDemise, dayOfWeek };

    // Agar admin ne koi bhi naya image format upload kiya hai
    if (req.file) {
      updatedData.imageName = req.file.filename;

      // Purani wali photo delete kar dein taake space free rahe
      if (person.imageName && person.imageName !== 'cover.jpg') {
        const oldImagePath = path.join(process.cwd(), 'uploads', person.imageName);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedPerson = await Marhoom.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ success: true, message: "Record successfully update ho gaya!", data: updatedPerson });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error! Update nahi ho saka.", error: error.message });
  }
});


// --- PORTAL LIVE COUNTER STATS ROUTES ---

// 5. GET API: Stats read karne ke liye
router.get('/stats/all', async (req, res) => {
  try {
    let stats = await Stats.findOne();
    if (!stats) {
      // Agar database me pehle se data nahi h to default create ho jaye
      stats = await Stats.create({ familiesCount: "120+", shajraCount: "50+" });
    }
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. PUT API: Admin jab dashboard se stats update karega
router.put('/stats/update', async (req, res) => {
  const { familiesCount, shajraCount } = req.body;
  try {
    let stats = await Stats.findOne();
    if (stats) {
      stats.familiesCount = familiesCount || stats.familiesCount;
      stats.shajraCount = shajraCount || stats.shajraCount;
      await stats.save();
    } else {
      stats = await Stats.create({ familiesCount, shajraCount });
    }
    res.json({ success: true, message: "Stats updated successfully!", data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;