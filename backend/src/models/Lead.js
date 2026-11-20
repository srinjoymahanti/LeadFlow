import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 25 },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  source: { type: String, required: true, enum: ['Website', 'Referral', 'Social Media', 'Cold Call', 'Advertisement', 'Other'] },
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Lost'], default: 'New', index: true }
}, { timestamps: true });
leadSchema.index({ owner: 1, createdAt: -1 });
leadSchema.index({ owner: 1, name: 1 });
export default mongoose.model('Lead', leadSchema);
