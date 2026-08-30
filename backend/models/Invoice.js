import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  services: [
    {
      serviceId: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid',
  },
  reminderDraft: {
    type: String,
    default: '',
  },
  reminderCount: {
    type: Number,
    default: 0,
  },
  flaggedForReview: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Invoice', invoiceSchema);
