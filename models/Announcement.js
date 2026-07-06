import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  type: { type: String, required: true },       // Vafat, Soyem, Elaan etc.
  title: { type: String, required: true },      // Heading
  date: { type: String, required: true },       // Tareekh
  details: { type: String, required: true },    // Mukammal Tafseelat
  badgeClass: { type: String, default: "" },    // Backend se automatic badge color handle karne ke liye
  image: { type: String, default: "" },         // Photo ka path save karne ke liye
  audio: { type: String, default: "" }          // 🔥 Voice note/Audio ka path save karne ke liye
}, { 
  timestamps: true // Yeh automatic createdAt aur updatedAt bana deta hai
});

// 🔥 DYNAMIC FIX: Built-in 'createdAt' field par 24 ghante (86400 seconds) ka TTL index
announcementSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;