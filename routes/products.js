import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import { authenticateAdmin, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper function to return product in original DB format
const formatProduct = (product) => {
  return product.toObject();
};

// Validation middleware
const validateProduct = [
  body('name.en').notEmpty().trim().withMessage('Product name (English) is required'),
  body('name.vi').notEmpty().trim().withMessage('Product name (Vietnamese) is required'),
  body('image').notEmpty().withMessage('Product image is required'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('shortDescription.en').optional().isString().trim().withMessage('Short description (English) must be a string'),
  body('shortDescription.vi').optional().isString().trim().withMessage('Short description (Vietnamese) must be a string'),
  body('detailDescription.en').notEmpty().trim().withMessage('Detail description (English) is required'),
  body('detailDescription.vi').notEmpty().trim().withMessage('Detail description (Vietnamese) is required'),
  body('weight').isNumeric().isFloat({ min: 0 }).withMessage('Weight must be a positive number (in kg)'),
  body('variations').isArray({ min: 1 }).withMessage('At least one variation is required'),
  body('variations.*.color.en').notEmpty().withMessage('Variation color (English) is required'),
  body('variations.*.color.vi').notEmpty().withMessage('Variation color (Vietnamese) is required'),
  body('variations.*.image').optional().isString().withMessage('Variation image must be a string'),
  body('variations.*.sizeOptions').isArray({ min: 1 }).withMessage('At least one size option is required per variation'),
  body('variations.*.sizeOptions.*.size').isNumeric().withMessage('Size must be a number'),
  body('variations.*.sizeOptions.*.price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('variations.*.sizeOptions.*.stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('specifications').optional().isArray().withMessage('Specifications must be an array'),
  body('specifications.*.key.en').optional().isString().notEmpty().withMessage('Specification key (English) is required'),
  body('specifications.*.key.vi').optional().isString().notEmpty().withMessage('Specification key (Vietnamese) is required'),
  body('specifications.*.value.en').optional().isString().notEmpty().withMessage('Specification value (English) is required'),
  body('specifications.*.value.vi').optional().isString().notEmpty().withMessage('Specification value (Vietnamese) is required')
];

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, inStock } = req.query;
    const query = {};

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by stock status
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    // Return products in original DB format
    const formattedProducts = products.map(product => formatProduct(product));

    res.json({
      products: formattedProducts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Return product in original DB format
    const formattedProduct = formatProduct(product);
    res.json(formattedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Create new product (Admin only)
router.post('/', authenticateAdmin, requireAdmin, validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product(req.body);
    const savedProduct = await product.save();
    
    // Return product in original DB format
    const formattedProduct = formatProduct(savedProduct);
    res.status(201).json(formattedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', authenticateAdmin, requireAdmin, validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Return product in original DB format
    const formattedProduct = formatProduct(product);
    res.json(formattedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', authenticateAdmin, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/products/:id/stock - Update stock for specific variation and size (Admin only)
router.patch('/:id/stock', authenticateAdmin, requireAdmin, async (req, res) => {
  try {
    const { variationIndex, sizeOptionIndex, stock } = req.body;
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }

    if (typeof variationIndex !== 'number' || typeof sizeOptionIndex !== 'number') {
      return res.status(400).json({ error: 'Variation index and size option index are required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.variations[variationIndex] || !product.variations[variationIndex].sizeOptions[sizeOptionIndex]) {
      return res.status(400).json({ error: 'Invalid variation or size option index' });
    }

    // Update the specific size option stock
    product.variations[variationIndex].sizeOptions[sizeOptionIndex].stock = stock;
    
    // Update overall inStock status based on all size options
    const hasStock = product.variations.some(variation => 
      variation.sizeOptions.some(sizeOption => sizeOption.stock > 0)
    );
    product.inStock = hasStock;

    const savedProduct = await product.save();

    // Return product in original DB format
    const formattedProduct = formatProduct(savedProduct);
    res.json(formattedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
