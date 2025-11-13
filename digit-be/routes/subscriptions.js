const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/subscriptions
 * @desc    Get all subscriptions for the logged-in user
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await query(
      `SELECT s.id, s.user_id, s.device_id, s.plan_id, s.period, s.quantity,
              s.start_date, s.end_date, s.status, s.amount, s.created_at, s.updated_at,
              p.plan, p.profile, p.amount as plan_amount,
              ud.saviour, ud.device_sim_no
       FROM subscriptions s
       LEFT JOIN plans p ON s.plan_id = p.id
       LEFT JOIN user_device ud ON s.device_id = ud.device_id AND s.user_id = ud.user_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/subscriptions/:id
 * @desc    Get subscription by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const result = await query(
      `SELECT s.id, s.user_id, s.device_id, s.plan_id, s.period, s.quantity,
              s.start_date, s.end_date, s.status, s.amount, s.created_at, s.updated_at,
              p.plan, p.profile, p.amount as plan_amount,
              ud.saviour, ud.device_sim_no
       FROM subscriptions s
       LEFT JOIN plans p ON s.plan_id = p.id
       LEFT JOIN user_device ud ON s.device_id = ud.device_id AND s.user_id = ud.user_id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check authorization - users can only view their own subscriptions
    if (role !== 'admin' && result.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own subscriptions'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription (purchase plan)
 * @access  Private
 */
router.post('/',
  authenticateToken,
  [
    body('device_id').notEmpty().withMessage('Device ID is required'),
    body('plan_id').isInt({ min: 1 }).withMessage('Valid plan ID is required'),
    body('period')
      .notEmpty()
      .isIn(['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'])
      .withMessage('Period must be one of: Monthly, Quarterly, Half Yearly, Yearly'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

      const { id: userId } = req.user;
      const { device_id, plan_id, period, quantity = 1 } = req.body;

      // Verify device belongs to user
      const deviceCheck = await query(
        'SELECT id FROM user_device WHERE user_id = $1 AND device_id = $2',
        [userId, device_id]
      );

      if (deviceCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Device not found or does not belong to you'
        });
      }

      // Get plan details
      const planResult = await query(
        'SELECT id, plan, profile, period as plan_period, amount FROM plans WHERE id = $1',
        [plan_id]
      );

      if (planResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found'
        });
      }

      const plan = planResult.rows[0];

      // Verify period matches plan
      if (plan.plan_period !== period) {
        return res.status(400).json({
          success: false,
          message: `Selected plan does not support ${period} period. Plan period is ${plan.plan_period}`
        });
      }

      // Calculate dates and amount
      const startDate = new Date();
      const endDate = new Date(startDate);
      
      switch (period) {
        case 'Monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'Quarterly':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'Half Yearly':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case 'Yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      const totalAmount = plan.amount * quantity;

      // Create subscription
      const result = await query(
        `INSERT INTO subscriptions (
          user_id, device_id, plan_id, period, quantity, start_date, end_date, amount, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, user_id, device_id, plan_id, period, quantity, start_date, end_date, amount, status, created_at`,
        [userId, device_id, plan_id, period, quantity, startDate, endDate, totalAmount, 'active']
      );

      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription',
        error: error.message
      });
    }
  }
);

/**
 * @route   PATCH /api/subscriptions/:id/status
 * @desc    Update subscription status
 * @access  Private
 */
router.patch('/:id/status',
  authenticateToken,
  [
    body('status')
      .isIn(['active', 'expired', 'cancelled'])
      .withMessage('Status must be one of: active, expired, cancelled')
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
      const { status } = req.body;
      const { id: userId, role } = req.user;

      // Check if subscription exists and belongs to user
      const subscriptionCheck = await query(
        'SELECT user_id FROM subscriptions WHERE id = $1',
        [id]
      );

      if (subscriptionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      // Authorization check
      if (role !== 'admin' && subscriptionCheck.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own subscriptions'
        });
      }

      const result = await query(
        `UPDATE subscriptions 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, user_id, device_id, plan_id, period, quantity, start_date, end_date, amount, status, updated_at`,
        [status, id]
      );

      res.json({
        success: true,
        message: 'Subscription status updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update subscription status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update subscription status',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/subscriptions/device/:deviceId
 * @desc    Get all subscriptions for a specific device
 * @access  Private
 */
router.get('/device/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { id: userId, role } = req.user;

    // Verify device belongs to user (unless admin)
    if (role !== 'admin') {
      const deviceCheck = await query(
        'SELECT id FROM user_device WHERE user_id = $1 AND device_id = $2',
        [userId, deviceId]
      );

      if (deviceCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Device not found or does not belong to you'
        });
      }
    }

    const result = await query(
      `SELECT s.id, s.user_id, s.device_id, s.plan_id, s.period, s.quantity,
              s.start_date, s.end_date, s.status, s.amount, s.created_at, s.updated_at,
              p.plan, p.profile, p.amount as plan_amount
       FROM subscriptions s
       LEFT JOIN plans p ON s.plan_id = p.id
       WHERE s.device_id = $1
       ORDER BY s.created_at DESC`,
      [deviceId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get device subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device subscriptions',
      error: error.message
    });
  }
});

module.exports = router;
