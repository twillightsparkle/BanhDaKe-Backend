import express from 'express';
import { Size } from '../models/Product.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/sizes - Get all sizes
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const sizes = await Size.find().sort({ EU: 1 }); // Sort by EU size ascending
    res.json({
      success: true,
      data: sizes
    });
  } catch (error) {
    console.error('Error fetching sizes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sizes',
      error: error.message
    });
  }
});

// GET /api/sizes/:id - Get size by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    
    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }

    res.json({
      success: true,
      data: size
    });
  } catch (error) {
    console.error('Error fetching size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch size',
      error: error.message
    });
  }
});

// POST /api/sizes - Create new size
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { EU, US } = req.body;

    // Validation
    if (!EU || !US) {
      return res.status(400).json({
        success: false,
        message: 'EU and US sizes are required'
      });
    }

    if (typeof EU !== 'number' || typeof US !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'EU and US sizes must be numbers'
      });
    }

    // Check if size already exists
    const existingSize = await Size.findOne({
      $or: [
        { EU: EU },
        { US: US }
      ]
    });

    if (existingSize) {
      return res.status(409).json({
        success: false,
        message: 'A size with this EU or US value already exists'
      });
    }

    const newSize = new Size({
      EU,
      US
    });

    const savedSize = await newSize.save();

    res.status(201).json({
      success: true,
      message: 'Size created successfully',
      data: savedSize
    });
  } catch (error) {
    console.error('Error creating size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create size',
      error: error.message
    });
  }
});

// PUT /api/sizes/:id - Update size
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { EU, US } = req.body;

    // Validation
    if (!EU || !US) {
      return res.status(400).json({
        success: false,
        message: 'EU and US sizes are required'
      });
    }

    if (typeof EU !== 'number' || typeof US !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'EU and US sizes must be numbers'
      });
    }

    // Check if another size with same EU or US exists (excluding current)
    const existingSize = await Size.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { EU: EU },
        { US: US }
      ]
    });

    if (existingSize) {
      return res.status(409).json({
        success: false,
        message: 'Another size with this EU or US value already exists'
      });
    }

    const updatedSize = await Size.findByIdAndUpdate(
      req.params.id,
      { EU, US },
      { new: true, runValidators: true }
    );

    if (!updatedSize) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }

    res.json({
      success: true,
      message: 'Size updated successfully',
      data: updatedSize
    });
  } catch (error) {
    console.error('Error updating size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update size',
      error: error.message
    });
  }
});

// DELETE /api/sizes/:id - Delete size
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const deletedSize = await Size.findByIdAndDelete(req.params.id);

    if (!deletedSize) {
      return res.status(404).json({
        success: false,
        message: 'Size not found'
      });
    }

    res.json({
      success: true,
      message: 'Size deleted successfully',
      data: deletedSize
    });
  } catch (error) {
    console.error('Error deleting size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete size',
      error: error.message
    });
  }
});

// GET /api/sizes/search - Search sizes by EU or US value
router.get('/search', authenticateAdmin, async (req, res) => {
  try {
    const { eu, us } = req.query;

    let query = {};
    if (eu) {
      query.EU = parseFloat(eu);
    }
    if (us) {
      query.US = parseFloat(us);
    }

    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide eu or us query parameter'
      });
    }

    const sizes = await Size.find(query);

    res.json({
      success: true,
      data: sizes
    });
  } catch (error) {
    console.error('Error searching sizes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search sizes',
      error: error.message
    });
  }
});

export default router;