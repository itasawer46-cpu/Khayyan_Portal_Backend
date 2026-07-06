import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  familiesCount: { type: String, default: "120+" },
  shajraCount: { type: String, default: "50+" }
}, { timestamps: true });

export default mongoose.model('Stats', statsSchema);