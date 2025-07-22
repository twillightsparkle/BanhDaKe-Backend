import mongoose from 'mongoose';

const shippingFeeSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  baseFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  perKgRate: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
shippingFeeSchema.index({ country: 1, isActive: 1 });

const ShippingFee = mongoose.model('ShippingFee', shippingFeeSchema);

export default ShippingFee;
