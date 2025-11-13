const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/tanks
 * @desc    Get all tanks for the logged-in user
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await query(
      `SELECT t.id, t.device_id, t.saviour_name, t.saviour_id, t.saviour_capacity,
              t.upper_threshold, t.lower_threshold, t.saviour_height, 
              t.created_at, t.updated_at,
              ud.saviour as device_saviour, ud.device_sim_no
       FROM tanks t
       LEFT JOIN user_device ud ON t.device_id = ud.device_id AND ud.user_id = $1
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get tanks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tanks',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/tanks/:id
 * @desc    Get tank by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const result = await query(
      `SELECT t.id, t.device_id, t.saviour_name, t.saviour_id, t.saviour_capacity,
              t.upper_threshold, t.lower_threshold, t.saviour_height, 
              t.created_at, t.updated_at,
              ud.saviour as device_saviour, ud.device_sim_no
       FROM tanks t
       LEFT JOIN user_device ud ON t.device_id = ud.device_id AND ud.user_id = $1
       WHERE t.id = $2`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tank not found'
      });
    }

    // Check authorization - users can only view their own tanks
    if (role !== 'admin' && result.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own tanks'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get tank error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tank',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/tanks
 * @desc    Create a new tank
 * @access  Private
 */
router.post('/',
  authenticateToken,
  [
    body('device_id').notEmpty().withMessage('Device ID is required'),
    body('saviour_name').notEmpty().withMessage('Saviour name is required'),
    body('saviour_capacity')
      .isFloat({ min: 0 })
      .withMessage('Saviour capacity must be a positive number'),
    body('upper_threshold')
      .isFloat({ min: 0 })
      .withMessage('Upper threshold must be a positive number'),
    body('lower_threshold')
      .isFloat({ min: 0 })
      .withMessage('Lower threshold must be a positive number'),
    body('saviour_height')
      .isFloat({ min: 0 })
      .withMessage('Saviour height must be a positive number')
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
      const {
        device_id,
        saviour_name,
        saviour_capacity,
        upper_threshold,
        lower_threshold,
        saviour_height
      } = req.body;

      // Validate that upper threshold is greater than lower threshold
      if (upper_threshold <= lower_threshold) {
        return res.status(400).json({
          success: false,
          message: 'Upper threshold must be greater than lower threshold'
        });
      }

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

      // Check if tank already exists for this device
      const existingTank = await query(
        'SELECT id FROM tanks WHERE device_id = $1 AND user_id = $2',
        [device_id, userId]
      );

      if (existingTank.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Tank already exists for this device'
        });
      }

      // Generate saviour_id (you can customize this logic)
      const saviourIdResult = await query(
        'SELECT COALESCE(MAX(saviour_id), 0) + 1 as next_id FROM tanks WHERE user_id = $1',
        [userId]
      );
      const saviourId = saviourIdResult.rows[0].next_id;

      // Create tank
      const result = await query(
        `INSERT INTO tanks (
          user_id, device_id, saviour_name, saviour_id, saviour_capacity,
          upper_threshold, lower_threshold, saviour_height
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id, device_id, saviour_name, saviour_id, saviour_capacity,
                  upper_threshold, lower_threshold, saviour_height, created_at`,
        [userId, device_id, saviour_name, saviourId, saviour_capacity,
         upper_threshold, lower_threshold, saviour_height]
      );

      res.status(201).json({
        success: true,
        message: 'Tank created successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Create tank error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create tank',
        error: error.message
      });
    }
  }
);

/**
 * @route   PATCH /api/tanks/:id
 * @desc    Update a tank
 * @access  Private
 */
router.patch('/:id',
  authenticateToken,
  [
    body('saviour_name').optional().notEmpty().withMessage('Saviour name cannot be empty'),
    body('saviour_capacity')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Saviour capacity must be a positive number'),
    body('upper_threshold')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Upper threshold must be a positive number'),
    body('lower_threshold')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Lower threshold must be a positive number'),
    body('saviour_height')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Saviour height must be a positive number')
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
      const { id: userId, role } = req.user;
      const {
        saviour_name,
        saviour_capacity,
        upper_threshold,
        lower_threshold,
        saviour_height
      } = req.body;

      // Check if tank exists and belongs to user
      const tankCheck = await query(
        'SELECT user_id, upper_threshold, lower_threshold FROM tanks WHERE id = $1',
        [id]
      );

      if (tankCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tank not found'
        });
      }

      // Authorization check
      if (role !== 'admin' && tankCheck.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own tanks'
        });
      }

      // Validate threshold relationship
      const currentTank = tankCheck.rows[0];
      const newUpperThreshold = upper_threshold !== undefined ? upper_threshold : currentTank.upper_threshold;
      const newLowerThreshold = lower_threshold !== undefined ? lower_threshold : currentTank.lower_threshold;

      if (newUpperThreshold <= newLowerThreshold) {
        return res.status(400).json({
          success: false,
          message: 'Upper threshold must be greater than lower threshold'
        });
      }

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (saviour_name !== undefined) {
        updates.push(`saviour_name = $${paramCount}`);
        values.push(saviour_name);
        paramCount++;
      }
      if (saviour_capacity !== undefined) {
        updates.push(`saviour_capacity = $${paramCount}`);
        values.push(saviour_capacity);
        paramCount++;
      }
      if (upper_threshold !== undefined) {
        updates.push(`upper_threshold = $${paramCount}`);
        values.push(upper_threshold);
        paramCount++;
      }
      if (lower_threshold !== undefined) {
        updates.push(`lower_threshold = $${paramCount}`);
        values.push(lower_threshold);
        paramCount++;
      }
      if (saviour_height !== undefined) {
        updates.push(`saviour_height = $${paramCount}`);
        values.push(saviour_height);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE tanks 
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING id, user_id, device_id, saviour_name, saviour_id, saviour_capacity,
                   upper_threshold, lower_threshold, saviour_height, updated_at`,
        values
      );

      res.json({
        success: true,
        message: 'Tank updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update tank error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update tank',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/tanks/:id
 * @desc    Delete a tank
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    // Check if tank exists and belongs to user
    const tankCheck = await query(
      'SELECT user_id FROM tanks WHERE id = $1',
      [id]
    );

    if (tankCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tank not found'
      });
    }

    // Authorization check
    if (role !== 'admin' && tankCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own tanks'
      });
    }

    await query('DELETE FROM tanks WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Tank deleted successfully'
    });

  } catch (error) {
    console.error('Delete tank error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tank',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/tanks/device/:deviceId
 * @desc    Get tank by device ID
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
      `SELECT t.id, t.device_id, t.saviour_name, t.saviour_id, t.saviour_capacity,
              t.upper_threshold, t.lower_threshold, t.saviour_height, 
              t.created_at, t.updated_at
       FROM tanks t
       WHERE t.device_id = $1 AND t.user_id = $2`,
      [deviceId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tank not found for this device'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get tank by device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tank',
      error: error.message
    });
  }
});

module.exports = router;
