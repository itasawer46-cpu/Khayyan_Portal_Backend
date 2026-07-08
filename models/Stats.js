import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  familiesCount: { type: String, default: "120+" },
  shajraCount: { type: String, default: "50+" }
}, { timestamps: true });

// 🔥 SERVERLESS FIX: Pehle check karein agar model bna hua hai, nahi toh naya banayein
const Stats = mongoose.models.Stats || mongoose.model('Stats', statsSchema);

export default Stats;