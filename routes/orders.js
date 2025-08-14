import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ShippingFee from '../models/ShippingFee.js';
import { authenticateAdmin, requireAdmin, authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateOrder = [
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.productId').notEmpty().withMessage('Product ID is required'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('products.*.selectedSize').notEmpty().withMessage('Selected size is required'),
  body('customerInfo.name').notEmpty().trim().withMessage('Customer name is required'),
  body('customerInfo.email').isEmail().withMessage('Valid email is required'),
  body('customerInfo.address').notEmpty().trim().withMessage('Customer address is required'),
  body('shippingCountry').notEmpty().withMessage('Shipping country is required')
];

// GET /api/orders - Get all orders (Admin only)
router.get('/', authenticateAdmin, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, email } = req.query;
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by customer email
    if (email) {
      query['customerInfo.email'] = email;
    }

    const orders = await Order.find(query)
      .populate('products.productId', 'name image')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id - Get single order (Admin only)
router.get('/:id', authenticateAdmin, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.productId', 'name image price');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - Create new order
router.post('/', validateOrder, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { products, customerInfo, shippingCountry } = req.body;

    // Get shipping fee data
    const shippingFeeData = await ShippingFee.findOne({ 
      country: shippingCountry.toUpperCase(), 
      isActive: true 
    });
    
    if (!shippingFeeData) {
      return res.status(400).json({ 
        error: `Shipping to ${shippingCountry} is not available` 
      });
    }

  // Validate products, calculate total and total weight (in kilograms)
    let total = 0;
    let totalWeight = 0;
    const orderItems = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ 
          error: `Product with ID ${item.productId} not found` 
        });
      }

      if (!product.inStock || product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for product ${product.name.en || product.name.vi || product.name}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

  // Calculate weight in kg (product.weight is stored in kilograms)
  const productWeightKg = (product.weight ?? 0.5); // Default 0.5 kg if weight not specified
  totalWeight += productWeightKg * item.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.name.en || product.name.vi || product.name,
        quantity: item.quantity,
        price: product.price,
        selectedSize: item.selectedSize
      });

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
        inStock: product.stock - item.quantity > 0
      });
    }

  // Calculate shipping fee: baseFee + (totalWeightInKg * perKgRate)
  const shippingFee = shippingFeeData.baseFee + (totalWeight * shippingFeeData.perKgRate);

    const order = new Order({
      products: orderItems,
      total,
      shippingFee,
      shippingCountry: shippingFeeData.country,
      totalWeight,
      customerInfo,
      status: 'Pending'
    });

    const savedOrder = await order.save();
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('products.productId', 'name image');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/orders/:id/status - Update order status (Admin only)
router.put('/:id/status', authenticateAdmin, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Shipped', 'Completed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status must be one of: Pending, Shipped, Completed' 
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('products.productId', 'name image');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/orders/:id - Delete order (Admin only, only if status is Pending)
router.delete('/:id', authenticateAdmin, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ 
        error: 'Can only delete orders with Pending status' 
      });
    }

    // Restore product stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/stats/summary - Get order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
    const completedOrders = await Order.countDocuments({ status: 'Completed' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['Shipped', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      shippedOrders,
      completedOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== USER ENDPOINTS ==============

// GET /api/orders/user/my-orders - Get current user's orders
router.get('/user/my-orders', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found in token' });
    }

    const query = {
      'customerInfo.email': userEmail
    };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('products.productId', 'name image')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      userEmail
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/user/:orderId - Get specific order by ID (only if user owns it)
router.get('/user/:orderId', authenticateUser, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const orderId = req.params.orderId;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found in token' });
    }

    const order = await Order.findOne({
      _id: orderId,
      'customerInfo.email': userEmail
    }).populate('products.productId', 'name image price');

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found or you do not have permission to view this order' 
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/user/stats/summary - Get user's order statistics
router.get('/user/stats/summary', authenticateUser, async (req, res) => {
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found in token' });
    }

    const query = { 'customerInfo.email': userEmail };

    const totalOrders = await Order.countDocuments(query);
    const pendingOrders = await Order.countDocuments({ ...query, status: 'Pending' });
    const shippedOrders = await Order.countDocuments({ ...query, status: 'Shipped' });
    const completedOrders = await Order.countDocuments({ ...query, status: 'Completed' });

    const totalSpent = await Order.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: { $add: ['$total', '$shippingFee'] } } } }
    ]);

    const recentOrders = await Order.find(query)
      .populate('products.productId', 'name image')
      .limit(5)
      .sort({ createdAt: -1 });

    res.json({
      totalOrders,
      pendingOrders,
      shippedOrders,
      completedOrders,
      totalSpent: totalSpent[0]?.total || 0,
      recentOrders,
      userEmail
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
