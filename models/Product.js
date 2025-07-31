import mongoose from 'mongoose';

// Schema for localized strings
const localizedStringSchema = new mongoose.Schema({
  en: {
    type: String,
    required: true,
    trim: true
  },
  vi: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

// Schema for product specifications
const productSpecificationSchema = new mongoose.Schema({
  key: {
    type: localizedStringSchema,
    required: true
  },
  value: {
    type: localizedStringSchema,
    required: true
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: localizedStringSchema,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
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
    type: localizedStringSchema,
    required: true
  },
  detailDescription: {
    type: localizedStringSchema,
    required: true
  },
  sizes: [{
    type: String,
    required: true
  }],
  specifications: {
    type: [productSpecificationSchema],
    default: []
  },
  weight: { // in grams
    type: Number,
    required: true,
    min: 0
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
productSchema.index({ 
  'name.en': 'text', 
  'name.vi': 'text', 
  'shortDescription.en': 'text', 
  'shortDescription.vi': 'text' 
});

const Product = mongoose.model('Product', productSchema);

export default Product;
