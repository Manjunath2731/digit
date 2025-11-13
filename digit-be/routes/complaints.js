const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/complaints
 * @desc    Get all complaints (admin gets all, users get their own)
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    let result;
    
    if (role === 'admin') {
      // Admin can see all complaints with user information
      result = await query(
        `SELECT c.id, c.user_id, c.comment, c.status, c.created_at, c.updated_at,
                u.name as user_name, u.email as user_email
         FROM complaints c
         LEFT JOIN users u ON c.user_id = u.id
         ORDER BY c.created_at DESC`
      );
    } else {
      // Regular users can only see their own complaints
      result = await query(
        `SELECT c.id, c.user_id, c.comment, c.status, c.created_at, c.updated_at,
                u.name as user_name
         FROM complaints c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC`,
        [userId]
      );
    }

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/complaints/:id
 * @desc    Get complaint by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const result = await query(
      `SELECT c.id, c.user_id, c.comment, c.status, c.created_at, c.updated_at,
              u.name as user_name, u.email as user_email
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check authorization - users can only view their own complaints
    if (role !== 'admin' && result.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own complaints'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/complaints
 * @desc    Create a new complaint
 * @access  Private
 */
router.post('/',
  authenticateToken,
  [
    body('comment')
      .notEmpty()
      .withMessage('Comment is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Comment must be between 10 and 1000 characters')
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
      const { comment } = req.body;

      // Create complaint
      const result = await query(
        `INSERT INTO complaints (user_id, comment, status)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, comment, status, created_at`,
        [userId, comment, 'pending']
      );

      res.status(201).json({
        success: true,
        message: 'Complaint created successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create complaint',
        error: error.message
      });
    }
  }
);

/**
 * @route   PATCH /api/complaints/:id
 * @desc    Update a complaint
 * @access  Private (users can update comment, admins can update status)
 */
router.patch('/:id',
  authenticateToken,
  [
    body('comment')
      .optional()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Comment must be between 10 and 1000 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'resolved', 'closed'])
      .withMessage('Status must be one of: pending, in_progress, resolved, closed')
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
      const { comment, status } = req.body;

      // Check if complaint exists
      const complaintCheck = await query(
        'SELECT user_id, status FROM complaints WHERE id = $1',
        [id]
      );

      if (complaintCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      const complaint = complaintCheck.rows[0];

      // Authorization check
      if (role !== 'admin' && complaint.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own complaints'
        });
      }

      // Only admins can update status
      if (status !== undefined && role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can update complaint status'
        });
      }

      // Users cannot update closed complaints
      if (complaint.status === 'closed' && role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot update closed complaints'
        });
      }

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (comment !== undefined) {
        updates.push(`comment = $${paramCount}`);
        values.push(comment);
        paramCount++;
      }
      if (status !== undefined) {
        updates.push(`status = $${paramCount}`);
        values.push(status);
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
        `UPDATE complaints 
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING id, user_id, comment, status, updated_at`,
        values
      );

      res.json({
        success: true,
        message: 'Complaint updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update complaint',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/complaints/:id
 * @desc    Delete a complaint
 * @access  Private (users can delete their own, admins can delete any)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    // Check if complaint exists
    const complaintCheck = await query(
      'SELECT user_id FROM complaints WHERE id = $1',
      [id]
    );

    if (complaintCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Authorization check
    if (role !== 'admin' && complaintCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own complaints'
      });
    }

    await query('DELETE FROM complaints WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });

  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/complaints/status/:status
 * @desc    Get complaints by status (admin only)
 * @access  Private (Admin)
 */
router.get('/status/:status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, in_progress, resolved, closed'
      });
    }

    const result = await query(
      `SELECT c.id, c.user_id, c.comment, c.status, c.created_at, c.updated_at,
              u.name as user_name, u.email as user_email
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.status = $1
       ORDER BY c.created_at DESC`,
      [status]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get complaints by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
});

module.exports = router;
