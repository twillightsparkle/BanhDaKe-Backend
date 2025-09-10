import mongoose from 'mongoose';

// Schema for localized strings
const localizedStringSchema = new mongoose.Schema({
  en: { type: String, trim: true },
  vi: { type: String, trim: true }
}, { _id: false });

const productSpecificationSchema = new mongoose.Schema({
  key: { type: localizedStringSchema, required: true },
  value: { type: localizedStringSchema, required: true }
}, { _id: false });

const sizeSchema = new mongoose.Schema({
  EU: { type: Number, required: true },
  US: { type: Number, required: true },
});

// Size option schema for each variation
const sizeOptionSchema = new mongoose.Schema({
  size: { type: sizeSchema, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 }
}, { _id: false });

// Variation schema for color and size options
const variationSchema = new mongoose.Schema({
  color: { type: localizedStringSchema, required: true }, // e.g. "Red", "Blue"
  image: { type: String},
  sizeOptions: { type: [sizeOptionSchema], required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: localizedStringSchema, required: true },
  image: { type: String, required: true },
  images: [{ type: String }],
  shortDescription: { type: localizedStringSchema, required: false }, // optional
  detailDescription: { type: localizedStringSchema, required: true },
  specifications: { type: [productSpecificationSchema], default: [] },
  weight: { type: Number, required: true, min: 0 }, // in kilograms (kg)
  variations: { type: [variationSchema], required: true },
  inStock: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Add index for better search performance
productSchema.index({ 
  'name.en': 'text', 
  'name.vi': 'text', 
  'shortDescription.en': 'text', 
  'shortDescription.vi': 'text' 
});

const Product = mongoose.model('Product', productSchema);

const Size = mongoose.model('Size', sizeSchema);

export { Product, Size };
export default Product;
