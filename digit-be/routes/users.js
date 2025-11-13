const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, isAdmin, isPrimaryUser } = require('../middleware/auth');
const { generateSimplePassword } = require('../utils/passwordGenerator');
const { sendWelcomeEmail } = require('../utils/emailService');

// Get all users created by the logged-in user (admin or user)
router.get('/', authenticateToken, isPrimaryUser, async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    
    let result;
    if (role === 'admin') {
      // Admin can see all users with their device info
      result = await query(
        `SELECT u.id, u.name, u.email, u.phone, u.role, u.access_level, u.status,
                u.noofsecuser, u.address, u.addressDetails, u.last_login_date,
                u.created_at, u.updated_at,
                json_agg(
                  json_build_object(
                    'device_id', ud.device_id,
                    'saviour', ud.saviour,
                    'device_sim_no', ud.device_sim_no,
                    'house_type', ud.house_type,
                    'sensor_type', ud.sensor_type,
                    'last_login_device', ud.last_login_device,
                    'os', ud.os,
                    'browser', ud.browser,
                    'is_primary', ud.is_primary,
                    'device_status', ud.status
                  )
                ) FILTER (WHERE ud.id IS NOT NULL) as devices
         FROM users u
         LEFT JOIN user_device ud ON u.id = ud.user_id
         WHERE u.role IN ('user', 'secondary_user')
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );
    } else {
      // Regular users can only see secondary users
      result = await query(
        `SELECT u.id, u.name, u.email, u.phone, u.role, u.access_level, u.status,
                u.noofsecuser, u.address, u.addressDetails, u.last_login_date,
                u.created_at, u.updated_at,
                json_agg(
                  json_build_object(
                    'device_id', ud.device_id,
                    'saviour', ud.saviour,
                    'device_sim_no', ud.device_sim_no,
                    'house_type', ud.house_type,
                    'sensor_type', ud.sensor_type,
                    'last_login_device', ud.last_login_device,
                    'os', ud.os,
                    'browser', ud.browser,
                    'is_primary', ud.is_primary,
                    'device_status', ud.status
                  )
                ) FILTER (WHERE ud.id IS NOT NULL) as devices
         FROM users u
         LEFT JOIN user_device ud ON u.id = ud.user_id
         WHERE u.role = 'secondary_user'
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );
    }

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Create new user (admin creates regular users, both can create secondary users)
router.post('/',
  authenticateToken,
  isPrimaryUser,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
    body('device').notEmpty().withMessage('Device ID is required'),
    body('noOfSecUsers').optional().isInt({ min: 0 }).withMessage('Number of secondary users must be a non-negative integer')
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

      const {
        name,
        email,
        phone,
        device,
        noOfSecUsers,
        saviour,
        deviceSimNo,
        houseType,
        sensorType,
        address,
        addressDetails
      } = req.body;

      const { role: creatorRole } = req.user;

      // Check if email already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Generate random password
      const randomPassword = generateSimplePassword(10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Determine user role based on creator
      const userRole = creatorRole === 'admin' ? 'user' : 'secondary_user';

      // Create user in users table
      const userResult = await query(
        `INSERT INTO users (
          name, email, phone, password, role, access_level, status,
          noofsecuser, address, addressDetails
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, name, email, phone, role, access_level, status,
                  noofsecuser, address, addressDetails, created_at`,
        [
          name,
          email,
          phone,
          hashedPassword,
          userRole,
          'limited',
          'active',
          noOfSecUsers ? parseInt(noOfSecUsers) : 0,
          address || null,
          addressDetails ? JSON.stringify(addressDetails) : null
        ]
      );

      const newUser = userResult.rows[0];

      // Create device record in user_device table
      const deviceResult = await query(
        `INSERT INTO user_device (
          user_id, device_id, saviour, device_sim_no, house_type, sensor_type, is_primary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, device_id, saviour, device_sim_no, house_type, sensor_type, is_primary, created_at`,
        [
          newUser.id,
          device,
          saviour || null,
          deviceSimNo || null,
          houseType || null,
          sensorType || null,
          true
        ]
      );

      // Send welcome email with credentials
      const emailResult = await sendWelcomeEmail(email, name, randomPassword, device);
      
      if (!emailResult.success) {
        console.warn('Failed to send welcome email:', emailResult.error);
      }

      // Combine user and device data
      const responseData = {
        ...newUser,
        device: deviceResult.rows[0],
        emailSent: emailResult.success
      };

      res.status(201).json({
        success: true,
        message: emailResult.success 
          ? 'User created successfully. Welcome email sent.' 
          : 'User created successfully. Failed to send welcome email.',
        data: responseData,
        password: randomPassword // Include password in response for admin reference
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message
      });
    }
  }
);

// Update user status
router.patch('/:id/status',
  authenticateToken,
  isPrimaryUser,
  [
    body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
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

      const result = await query(
        `UPDATE users 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, name, email, phone, role, access_level, status, device,
                   saviour, noofsecuser, deviceSimNo, houseType, sensorType,
                   address, addressDetails, updated_at`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
        error: error.message
      });
    }
  }
);

// Delete user
router.delete('/:id', authenticateToken, isPrimaryUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.access_level, u.status,
              u.noofsecuser, u.address, u.addressDetails, u.last_login_date,
              u.created_at, u.updated_at,
              json_agg(
                json_build_object(
                  'device_id', ud.device_id,
                  'saviour', ud.saviour,
                  'device_sim_no', ud.device_sim_no,
                  'house_type', ud.house_type,
                  'sensor_type', ud.sensor_type,
                  'last_login_device', ud.last_login_device,
                  'os', ud.os,
                  'browser', ud.browser,
                  'is_primary', ud.is_primary,
                  'device_status', ud.status
                )
              ) FILTER (WHERE ud.id IS NOT NULL) as devices
       FROM users u
       LEFT JOIN user_device ud ON u.id = ud.user_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Add new device to existing user
router.post('/:id/devices',
  authenticateToken,
  [
    body('device').notEmpty().withMessage('Device ID is required'),
    body('saviour').optional(),
    body('deviceSimNo').optional(),
    body('houseType').optional(),
    body('sensorType').optional(),
    body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean')
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

      const { id: userId } = req.params;
      const {
        device,
        saviour,
        deviceSimNo,
        houseType,
        sensorType,
        isPrimary = false
      } = req.body;

      const { id: requesterId, role } = req.user;

      // Check if user exists
      const userCheck = await query(
        'SELECT id, role FROM users WHERE id = $1',
        [userId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Authorization check: Users can only add devices to their own account
      // Admins can add devices to any user account
      if (role !== 'admin' && requesterId !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You can only add devices to your own account'
        });
      }

      // Check if device already exists for this user
      const existingDevice = await query(
        'SELECT id FROM user_device WHERE user_id = $1 AND device_id = $2',
        [userId, device]
      );

      if (existingDevice.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'This device is already registered for this user'
        });
      }

      // If isPrimary is true, set all other devices to non-primary
      if (isPrimary) {
        await query(
          'UPDATE user_device SET is_primary = false WHERE user_id = $1',
          [userId]
        );
      }

      // Add new device
      const deviceResult = await query(
        `INSERT INTO user_device (
          user_id, device_id, saviour, device_sim_no, house_type, sensor_type, is_primary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, device_id, saviour, device_sim_no, house_type, sensor_type, is_primary, status, created_at`,
        [
          userId,
          device,
          saviour || null,
          deviceSimNo || null,
          houseType || null,
          sensorType || null,
          isPrimary
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Device added successfully',
        data: deviceResult.rows[0]
      });

    } catch (error) {
      console.error('Add device error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'This device is already registered for this user'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add device',
        error: error.message
      });
    }
  }
);

// Get all devices for a user
router.get('/:id/devices', authenticateToken, async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { id: requesterId, role } = req.user;

    // Authorization check
    if (role !== 'admin' && requesterId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own devices'
      });
    }

    const result = await query(
      `SELECT id, device_id, saviour, device_sim_no, house_type, sensor_type,
              last_login_device, os, browser, is_primary, status, created_at, updated_at
       FROM user_device
       WHERE user_id = $1
       ORDER BY is_primary DESC, created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch devices',
      error: error.message
    });
  }
});

// Update device information
router.patch('/:userId/devices/:deviceId',
  authenticateToken,
  [
    body('saviour').optional(),
    body('deviceSimNo').optional(),
    body('houseType').optional(),
    body('sensorType').optional(),
    body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive')
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

      const { userId, deviceId } = req.params;
      const { id: requesterId, role } = req.user;

      // Authorization check
      if (role !== 'admin' && requesterId !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own devices'
        });
      }

      const {
        saviour,
        deviceSimNo,
        houseType,
        sensorType,
        isPrimary,
        status
      } = req.body;

      // If isPrimary is being set to true, set all other devices to non-primary
      if (isPrimary === true) {
        await query(
          'UPDATE user_device SET is_primary = false WHERE user_id = $1',
          [userId]
        );
      }

      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (saviour !== undefined) {
        updates.push(`saviour = $${paramCount++}`);
        values.push(saviour);
      }
      if (deviceSimNo !== undefined) {
        updates.push(`device_sim_no = $${paramCount++}`);
        values.push(deviceSimNo);
      }
      if (houseType !== undefined) {
        updates.push(`house_type = $${paramCount++}`);
        values.push(houseType);
      }
      if (sensorType !== undefined) {
        updates.push(`sensor_type = $${paramCount++}`);
        values.push(sensorType);
      }
      if (isPrimary !== undefined) {
        updates.push(`is_primary = $${paramCount++}`);
        values.push(isPrimary);
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

      values.push(userId, deviceId);

      const result = await query(
        `UPDATE user_device 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $${paramCount++} AND device_id = $${paramCount++}
         RETURNING id, device_id, saviour, device_sim_no, house_type, sensor_type,
                   is_primary, status, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Device not found for this user'
        });
      }

      res.json({
        success: true,
        message: 'Device updated successfully',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Update device error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update device',
        error: error.message
      });
    }
  }
);

// Delete device from user
router.delete('/:userId/devices/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { userId, deviceId } = req.params;
    const { id: requesterId, role } = req.user;

    // Authorization check
    if (role !== 'admin' && requesterId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own devices'
      });
    }

    // Check if this is the only device
    const deviceCount = await query(
      'SELECT COUNT(*) as count FROM user_device WHERE user_id = $1',
      [userId]
    );

    if (parseInt(deviceCount.rows[0].count) <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last device. User must have at least one device.'
      });
    }

    const result = await query(
      'DELETE FROM user_device WHERE user_id = $1 AND device_id = $2 RETURNING id, device_id',
      [userId, deviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Device not found for this user'
      });
    }

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });

  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete device',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/users/:id/devices/bulk
 * @desc    Update user devices in bulk (add/remove multiple devices)
 * @access  Private
 */
router.put('/:id/devices/bulk',
  authenticateToken,
  [
    body('deviceIds')
      .isArray()
      .withMessage('deviceIds must be an array')
      .notEmpty()
      .withMessage('deviceIds array cannot be empty'),
    body('deviceIds.*')
      .notEmpty()
      .withMessage('Each device ID must not be empty')
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

      const { id: userId } = req.params;
      const { deviceIds } = req.body;
      const { id: requesterId, role } = req.user;

      // Authorization check
      if (role !== 'admin' && requesterId !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own devices'
        });
      }

      // Check if user exists
      const userCheck = await query(
        'SELECT id FROM users WHERE id = $1',
        [userId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get current devices for the user
      const currentDevices = await query(
        'SELECT device_id FROM user_device WHERE user_id = $1',
        [userId]
      );

      const currentDeviceIds = currentDevices.rows.map(row => row.device_id);
      const newDeviceIds = deviceIds;

      // Find devices to add (in newDeviceIds but not in currentDeviceIds)
      const devicesToAdd = newDeviceIds.filter(id => !currentDeviceIds.includes(id));

      // Find devices to remove (in currentDeviceIds but not in newDeviceIds)
      const devicesToRemove = currentDeviceIds.filter(id => !newDeviceIds.includes(id));

      // Remove devices
      if (devicesToRemove.length > 0) {
        const placeholders = devicesToRemove.map((_, index) => `$${index + 2}`).join(', ');
        await query(
          `DELETE FROM user_device 
           WHERE user_id = $1 AND device_id IN (${placeholders})`,
          [userId, ...devicesToRemove]
        );
      }

      // Add new devices
      const addedDevices = [];
      for (const deviceId of devicesToAdd) {
        try {
          const result = await query(
            `INSERT INTO user_device (user_id, device_id, is_primary, status)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, device_id) DO NOTHING
             RETURNING id, user_id, device_id, saviour, device_sim_no, house_type, 
                       sensor_type, is_primary, status, created_at`,
            [userId, deviceId, false, 'active']
          );
          
          if (result.rows.length > 0) {
            addedDevices.push(result.rows[0]);
          }
        } catch (error) {
          console.error(`Error adding device ${deviceId}:`, error);
        }
      }

      // Get updated device list
      const updatedDevices = await query(
        `SELECT id, user_id, device_id, saviour, device_sim_no, house_type, 
                sensor_type, is_primary, status, created_at, updated_at
         FROM user_device 
         WHERE user_id = $1
         ORDER BY is_primary DESC, created_at ASC`,
        [userId]
      );

      res.json({
        success: true,
        message: 'Devices updated successfully',
        data: {
          devices: updatedDevices.rows,
          added: addedDevices.length,
          removed: devicesToRemove.length,
          total: updatedDevices.rows.length
        }
      });

    } catch (error) {
      console.error('Bulk update devices error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update devices',
        error: error.message
      });
    }
  }
);

module.exports = router;
