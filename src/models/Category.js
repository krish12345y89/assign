import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String
});

export default mongoose.model('Category', categorySchema);
