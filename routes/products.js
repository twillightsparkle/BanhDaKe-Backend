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
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('image').notEmpty().withMessage('Product image is required'),
  body('shortDescription.en').notEmpty().trim().withMessage('Short description (English) is required'),
  body('shortDescription.vi').notEmpty().trim().withMessage('Short description (Vietnamese) is required'),
  body('detailDescription.en').notEmpty().trim().withMessage('Detail description (English) is required'),
  body('detailDescription.vi').notEmpty().trim().withMessage('Detail description (Vietnamese) is required'),
  body('sizes').isArray({ min: 1 }).withMessage('At least one size is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('specifications').optional().isArray().withMessage('Specifications must be an array'),
  body('specifications.*.key.en').optional().notEmpty().withMessage('Specification key (English) is required'),
  body('specifications.*.key.vi').optional().notEmpty().withMessage('Specification key (Vietnamese) is required'),
  body('specifications.*.value.en').optional().notEmpty().withMessage('Specification value (English) is required'),
  body('specifications.*.value.vi').optional().notEmpty().withMessage('Specification value (Vietnamese) is required')
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

// PATCH /api/products/:id/stock - Update stock (Admin only)
router.patch('/:id/stock', authenticateAdmin, requireAdmin, async (req, res) => {
  try {
    const { stock } = req.body;
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        stock,
        inStock: stock > 0
      },
      { new: true }
    );

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

export default router;
