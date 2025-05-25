import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  city: { type: String, required: true },
  state: { type: String, required: true }
});

export default mongoose.model('Location', locationSchema);
