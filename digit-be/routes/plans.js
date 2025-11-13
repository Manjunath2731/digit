const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/plans
 * @desc    Get all plans
 * @access  Private (Admin only)
 */
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, plan, profile, period, amount, created_at, updated_at
       FROM plans
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/plans/:id
 * @desc    Get plan by ID
 * @access  Private (Admin only)
 */
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, plan, profile, period, amount, created_at, updated_at
       FROM plans
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/plans
 * @desc    Create a new plan
 * @access  Private (Admin only)
 */
router.post('/',
  authenticateToken,
  isAdmin,
  [
    body('plan').notEmpty().trim().withMessage('Plan name is required'),
    body('profile')
      .notEmpty()
      .isIn(['Saviour', 'Ni-Sensu', 'Smart Jar'])
      .withMessage('Profile must be one of: Saviour, Ni-Sensu, Smart Jar'),
    body('period')
      .notEmpty()
      .isIn(['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'])
      .withMessage('Period must be one of: Monthly, Quarterly, Half Yearly, Yearly'),
    body('amount')
      .isNumeric()
      .custom((value) => value >= 0)
      .withMessage('Amount must be a non-negative number')
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

      const { plan, profile, period, amount } = req.body;

      // Check if plan with same profile and period already exists
      const existingPlan = await query(
        `SELECT id FROM plans 
         WHERE plan = $1 AND profile = $2 AND period = $3`,
        [plan, profile, period]
      );

      if (existingPlan.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'A plan with this name, profile, and period already exists'
        });
      }

      // Create new plan
      const result = await query(
        `INSERT INTO plans (plan, profile, period, amount)
         VALUES ($1, $2, $3, $4)
         RETURNING id, plan, profile, period, amount, created_at, updated_at`,
        [plan, profile, period, parseFloat(amount)]
      );

      res.status(201).json({
        success: true,
        message: 'Plan created successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Create plan error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'A plan with this combination already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   PATCH /api/plans/:id
 * @desc    Update a plan
 * @access  Private (Admin only)
 */
router.patch('/:id',
  authenticateToken,
  isAdmin,
  [
    body('plan').optional().trim().notEmpty().withMessage('Plan name cannot be empty'),
    body('profile')
      .optional()
      .isIn(['Saviour', 'Ni-Sensu', 'Smart Jar'])
      .withMessage('Profile must be one of: Saviour, Ni-Sensu, Smart Jar'),
    body('period')
      .optional()
      .isIn(['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'])
      .withMessage('Period must be one of: Monthly, Quarterly, Half Yearly, Yearly'),
    body('amount')
      .optional()
      .isNumeric()
      .custom((value) => value >= 0)
      .withMessage('Amount must be a non-negative number')
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
      const { plan, profile, period, amount } = req.body;

      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (plan !== undefined) {
        updates.push(`plan = $${paramCount++}`);
        values.push(plan);
      }
      if (profile !== undefined) {
        updates.push(`profile = $${paramCount++}`);
        values.push(profile);
      }
      if (period !== undefined) {
        updates.push(`period = $${paramCount++}`);
        values.push(period);
      }
      if (amount !== undefined) {
        updates.push(`amount = $${paramCount++}`);
        values.push(parseFloat(amount));
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      values.push(id);

      const result = await query(
        `UPDATE plans 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING id, plan, profile, period, amount, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      res.json({
        success: true,
        message: 'Plan updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update plan error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'A plan with this combination already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update plan',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/plans/:id
 * @desc    Delete a plan
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM plans WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });

  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete plan',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/plans/profile/:profile
 * @desc    Get all plans by profile type
 * @access  Private (Admin only)
 */
router.get('/profile/:profile', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { profile } = req.params;

    // Validate profile
    const validProfiles = ['Saviour', 'Ni-Sensu', 'Smart Jar'];
    if (!validProfiles.includes(profile)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile. Must be one of: Saviour, Ni-Sensu, Smart Jar'
      });
    }

    const result = await query(
      `SELECT id, plan, profile, period, amount, created_at, updated_at
       FROM plans
       WHERE profile = $1
       ORDER BY 
         CASE period
           WHEN 'Monthly' THEN 1
           WHEN 'Quarterly' THEN 2
           WHEN 'Half Yearly' THEN 3
           WHEN 'Yearly' THEN 4
         END`,
      [profile]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get plans by profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
});

module.exports = router;
