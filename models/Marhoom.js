import mongoose from 'mongoose';

const marhoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    required: true
  },
  wand: {
    type: String,
    required: true
  },
  dateOfDemise: {
    type: String, // String format me validation aasan rehti hai
    required: true
  },
  dayOfWeek: {
    type: String,
    required: true
  },
  imageName: {
    type: String,
    default: '' // Agar tasveer select na ho to khali string rahegi
  }
}, { timestamps: true }); // Is se data add hone ka exact date aur time khud record ho jayega

// 🔥 SERVERLESS FIX: Pehle check karein agar model bna hua hai, nahi toh naya banayein
const Marhoom = mongoose.models.Marhoom || mongoose.model('Marhoom', marhoomSchema);

export default Marhoom;