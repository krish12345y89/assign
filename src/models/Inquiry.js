import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  budget: { type: Number, required: true },
  city: { type: String, required: true },
  referenceImage: { type: String },
  assignedPartners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // role: partner
  }],
  status: {
    type: String,
    enum: ['new', 'responded', 'booked', 'closed'],
    default: 'new',
  }
}, { timestamps: true });

export default mongoose.model('Inquiry', inquirySchema);
