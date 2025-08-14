import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  selectedColor: {
    type: String,
    required: true
  },
  selectedSize: {
    type: String,
    required: true
  }
});

const customerInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  }
});

const orderSchema = new mongoose.Schema({
  products: [orderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCountry: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  totalWeight: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  customerInfo: {
    type: customerInfoSchema,
    required: true
  },
  firebaseUid: {
    type: String,
    sparse: true, // Allows multiple null values but unique non-null values
    index: true   // For faster queries by Firebase UID
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Completed'],
    default: 'Pending'
  }
}, {
  timestamps: true // This will add createdAt and updatedAt automatically
});

// Add index for better query performance
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'customerInfo.email': 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
