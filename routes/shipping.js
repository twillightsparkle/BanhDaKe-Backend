import express from 'express';
import ShippingFee from '../models/ShippingFee.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Client Routes (No authentication required)

// GET /api/shipping/rates/:country - Get shipping rates for a specific country
router.get('/rates/:country', async (req, res) => {
  try {
    const { country } = req.params;
    
    const shippingFee = await ShippingFee.findOne({ 
      country: country.toUpperCase(), 
      isActive: true 
    });
    
    if (!shippingFee) {
      return res.status(404).json({
        success: false,
        message: `Shipping to ${country} is not available`
      });
    }
    
    res.json({
      success: true,
      data: {
        country: shippingFee.country,
        baseFee: shippingFee.baseFee,
        perKgRate: shippingFee.perKgRate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping rates'
    });
  }
});

// GET /api/shipping/countries - Get list of available shipping countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await ShippingFee.find(
      { isActive: true },
      'country baseFee perKgRate'
    ).sort({ country: 1 });
    
    res.json({
      success: true,
      data: countries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping countries'
    });
  }
});

// Admin Routes (Authentication required)

// GET /api/shipping/admin - Get all shipping fees (for admin)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (search) {
      query.country = { $regex: search, $options: 'i' };
    }
    
    const [shippingFees, total] = await Promise.all([
      ShippingFee.find(query)
        .sort({ country: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ShippingFee.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: shippingFees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping fees'
    });
  }
});

// POST /api/shipping/admin - Create new shipping fee
router.post('/admin', authenticateAdmin, async (req, res) => {
  try {
    const { country, baseFee, perKgRate, isActive = true } = req.body;
    
    if (!country || baseFee === undefined || perKgRate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Country, baseFee, and perKgRate are required'
      });
    }
    
    const shippingFee = new ShippingFee({
      country: country.toUpperCase(),
      baseFee,
      perKgRate,
      isActive
    });
    
    await shippingFee.save();
    
    res.status(201).json({
      success: true,
      data: shippingFee,
      message: 'Shipping fee created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Shipping fee for this country already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/shipping/admin/:id - Get specific shipping fee
router.get('/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const shippingFee = await ShippingFee.findById(req.params.id);
    
    if (!shippingFee) {
      return res.status(404).json({
        success: false,
        message: 'Shipping fee not found'
      });
    }
    
    res.json({
      success: true,
      data: shippingFee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping fee'
    });
  }
});

// PUT /api/shipping/admin/:id - Update shipping fee
router.put('/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const { country, baseFee, perKgRate, isActive } = req.body;
    
    const updateData = {};
    if (country !== undefined) updateData.country = country.toUpperCase();
    if (baseFee !== undefined) updateData.baseFee = baseFee;
    if (perKgRate !== undefined) updateData.perKgRate = perKgRate;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const shippingFee = await ShippingFee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!shippingFee) {
      return res.status(404).json({
        success: false,
        message: 'Shipping fee not found'
      });
    }
    
    res.json({
      success: true,
      data: shippingFee,
      message: 'Shipping fee updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/shipping/admin/:id - Delete shipping fee
router.delete('/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const shippingFee = await ShippingFee.findByIdAndDelete(req.params.id);
    
    if (!shippingFee) {
      return res.status(404).json({
        success: false,
        message: 'Shipping fee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Shipping fee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting shipping fee'
    });
  }
});

// PATCH /api/shipping/admin/:id/toggle - Toggle active status
router.patch('/admin/:id/toggle', authenticateAdmin, async (req, res) => {
  try {
    const shippingFee = await ShippingFee.findById(req.params.id);
    
    if (!shippingFee) {
      return res.status(404).json({
        success: false,
        message: 'Shipping fee not found'
      });
    }
    
    shippingFee.isActive = !shippingFee.isActive;
    await shippingFee.save();
    
    res.json({
      success: true,
      data: shippingFee,
      message: `Shipping fee ${shippingFee.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling shipping fee status'
    });
  }
});

export default router;
