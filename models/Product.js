import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  shortDescription: {
    type: String,
    required: true,
    trim: true
  },
  detailDescription: {
    type: String,
    required: true,
    trim: true
  },
  sizes: [{
    type: String,
    required: true
  }],
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true // This will add createdAt and updatedAt automatically
});

// Add index for better search performance
productSchema.index({ name: 'text', shortDescription: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
