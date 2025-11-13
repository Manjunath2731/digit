const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/service-engineers
 * @desc    Get all service engineers
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, contact_number, pincode, address, status, created_at, updated_at
       FROM service_engineers
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get service engineers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service engineers',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/service-engineers/:id
 * @desc    Get service engineer by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, email, contact_number, pincode, address, status, created_at, updated_at
       FROM service_engineers
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service engineer not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get service engineer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service engineer',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/service-engineers
 * @desc    Create a new service engineer
 * @access  Private
 */
router.post('/',
  authenticateToken,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is invalid'),
    body('contact_number')
      .notEmpty()
      .withMessage('Contact number is required')
      .matches(/^\d{10}$/)
      .withMessage('Contact number must be 10 digits'),
    body('pincode')
      .notEmpty()
      .withMessage('Pincode is required')
      .matches(/^\d{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('address').notEmpty().withMessage('Address is required')
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

      const { name, email, contact_number, pincode, address } = req.body;

      // Check if email already exists
      const emailCheck = await query(
        'SELECT id FROM service_engineers WHERE email = $1',
        [email]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Create service engineer
      const result = await query(
        `INSERT INTO service_engineers (name, email, contact_number, pincode, address, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, contact_number, pincode, address, status, created_at`,
        [name, email, contact_number, pincode, address, 'active']
      );

      res.status(201).json({
        success: true,
        message: 'Service engineer created successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Create service engineer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create service engineer',
        error: error.message
      });
    }
  }
);

/**
 * @route   PATCH /api/service-engineers/:id
 * @desc    Update a service engineer
 * @access  Private
 */
router.patch('/:id',
  authenticateToken,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email is invalid'),
    body('contact_number')
      .optional()
      .matches(/^\d{10}$/)
      .withMessage('Contact number must be 10 digits'),
    body('pincode')
      .optional()
      .matches(/^\d{6}$/)
      .withMessage('Pincode must be 6 digits'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be either active or inactive')
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
      const { name, email, contact_number, pincode, address, status } = req.body;

      // Check if service engineer exists
      const engineerCheck = await query(
        'SELECT id FROM service_engineers WHERE id = $1',
        [id]
      );

      if (engineerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Service engineer not found'
        });
      }

      // If email is being updated, check if it's already taken
      if (email) {
        const emailCheck = await query(
          'SELECT id FROM service_engineers WHERE email = $1 AND id != $2',
          [email, id]
        );

        if (emailCheck.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(name);
        paramCount++;
      }
      if (email !== undefined) {
        updates.push(`email = $${paramCount}`);
        values.push(email);
        paramCount++;
      }
      if (contact_number !== undefined) {
        updates.push(`contact_number = $${paramCount}`);
        values.push(contact_number);
        paramCount++;
      }
      if (pincode !== undefined) {
        updates.push(`pincode = $${paramCount}`);
        values.push(pincode);
        paramCount++;
      }
      if (address !== undefined) {
        updates.push(`address = $${paramCount}`);
        values.push(address);
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
        `UPDATE service_engineers 
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING id, name, email, contact_number, pincode, address, status, updated_at`,
        values
      );

      res.json({
        success: true,
        message: 'Service engineer updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update service engineer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update service engineer',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/service-engineers/:id
 * @desc    Delete a service engineer
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service engineer exists
    const engineerCheck = await query(
      'SELECT id FROM service_engineers WHERE id = $1',
      [id]
    );

    if (engineerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service engineer not found'
      });
    }

    await query('DELETE FROM service_engineers WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Service engineer deleted successfully'
    });

  } catch (error) {
    console.error('Delete service engineer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service engineer',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/service-engineers/pincode/:pincode
 * @desc    Get service engineers by pincode
 * @access  Private
 */
router.get('/pincode/:pincode', authenticateToken, async (req, res) => {
  try {
    const { pincode } = req.params;

    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format. Must be 6 digits.'
      });
    }

    const result = await query(
      `SELECT id, name, email, contact_number, pincode, address, status, created_at, updated_at
       FROM service_engineers
       WHERE pincode = $1 AND status = 'active'
       ORDER BY created_at DESC`,
      [pincode]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get service engineers by pincode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service engineers',
      error: error.message
    });
  }
});

module.exports = router;
