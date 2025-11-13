const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/cities
 * @desc    Get all cities
 * @access  Private (Admin only)
 */
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, state, status, created_at, updated_at
       FROM cities
       ORDER BY name ASC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/cities/:id
 * @desc    Get city by ID
 * @access  Private (Admin only)
 */
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, state, status, created_at, updated_at
       FROM cities
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get city error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch city',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/cities
 * @desc    Create a new city
 * @access  Private (Admin only)
 */
router.post('/',
  authenticateToken,
  isAdmin,
  [
    body('name').notEmpty().trim().withMessage('City name is required'),
    body('state').notEmpty().trim().withMessage('State is required'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, state, status = 'active' } = req.body;

      // Check if city already exists in the same state
      const existingCity = await query(
        `SELECT id FROM cities 
         WHERE LOWER(name) = LOWER($1) AND LOWER(state) = LOWER($2)`,
        [name, state]
      );

      if (existingCity.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'A city with this name already exists in this state'
        });
      }

      // Create new city
      const result = await query(
        `INSERT INTO cities (name, state, status)
         VALUES ($1, $2, $3)
         RETURNING id, name, state, status, created_at, updated_at`,
        [name, state, status]
      );

      res.status(201).json({
        success: true,
        message: 'City created successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Create city error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'A city with this name already exists in this state'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create city',
        error: error.message
      });
    }
  }
);

/**
 * @route   PATCH /api/cities/:id
 * @desc    Update a city
 * @access  Private (Admin only)
 */
router.patch('/:id',
  authenticateToken,
  isAdmin,
  [
    body('name').optional().trim().notEmpty().withMessage('City name cannot be empty'),
    body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { name, state, status } = req.body;

      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (state !== undefined) {
        updates.push(`state = $${paramCount++}`);
        values.push(state);
      }
      if (status !== undefined) {
        updates.push(`status = $${paramCount++}`);
        values.push(status);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      values.push(id);

      const result = await query(
        `UPDATE cities 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING id, name, state, status, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'City not found'
        });
      }

      res.json({
        success: true,
        message: 'City updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update city error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'A city with this name already exists in this state'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update city',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/cities/:id
 * @desc    Delete a city
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM cities WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    res.json({
      success: true,
      message: 'City deleted successfully'
    });

  } catch (error) {
    console.error('Delete city error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete city',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/cities/state/:state
 * @desc    Get all cities by state
 * @access  Private (Admin only)
 */
router.get('/state/:state', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { state } = req.params;

    const result = await query(
      `SELECT id, name, state, status, created_at, updated_at
       FROM cities
       WHERE LOWER(state) = LOWER($1)
       ORDER BY name ASC`,
      [state]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get cities by state error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities',
      error: error.message
    });
  }
});

module.exports = router;
