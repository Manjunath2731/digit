const { pool } = require('../config/database');

const createTables = async () => {
  try {
    console.log('🔄 Creating database tables...');

    // Create users table (for user authentication and basic info)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(10) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'secondary_user')),
        access_level VARCHAR(50) DEFAULT 'limited' CHECK (access_level IN ('full', 'limited', 'view_only')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        noofsecuser INTEGER DEFAULT 0,
        address TEXT,
        addressDetails JSONB,
        last_login_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create user_device table (for device-related information)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_device (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_id VARCHAR(255) NOT NULL,
        saviour VARCHAR(50),
        device_sim_no VARCHAR(20),
        house_type VARCHAR(50),
        sensor_type VARCHAR(50),
        last_login_device VARCHAR(255),
        os VARCHAR(100),
        browser VARCHAR(100),
        is_primary BOOLEAN DEFAULT true,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, device_id)
      );
    `);
    console.log('✅ User_device table created');

    // Create indexes on users table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    // Create indexes on user_device table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_device_user_id ON user_device(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_device_device_id ON user_device(device_id);
    `);

    // Create plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        plan VARCHAR(100) NOT NULL,
        profile VARCHAR(50) NOT NULL CHECK (profile IN ('Saviour', 'Ni-Sensu', 'Smart Jar')),
        period VARCHAR(50) NOT NULL CHECK (period IN ('Monthly', 'Quarterly', 'Half Yearly', 'Yearly')),
        amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(plan, profile, period)
      );
    `);
    console.log('✅ Plans table created');

    // Create indexes on plans table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_plans_profile ON plans(profile);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_plans_period ON plans(period);
    `);

    // Create cities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, state)
      );
    `);
    console.log('✅ Cities table created');

    // Create indexes on cities table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cities_status ON cities(status);
    `);

    // Create subscriptions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_id VARCHAR(255) NOT NULL,
        plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
        period VARCHAR(50) NOT NULL CHECK (period IN ('Monthly', 'Quarterly', 'Half Yearly', 'Yearly')),
        quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Subscriptions table created');

    // Create indexes on subscriptions table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_device_id ON subscriptions(device_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);
    `);

    // Create tanks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tanks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_id VARCHAR(255) NOT NULL,
        saviour_name VARCHAR(100) NOT NULL,
        saviour_id INTEGER NOT NULL,
        saviour_capacity DECIMAL(10, 2) NOT NULL CHECK (saviour_capacity > 0),
        upper_threshold DECIMAL(10, 2) NOT NULL CHECK (upper_threshold > 0),
        lower_threshold DECIMAL(10, 2) NOT NULL CHECK (lower_threshold > 0),
        saviour_height DECIMAL(10, 2) NOT NULL CHECK (saviour_height > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(device_id, user_id),
        CHECK (upper_threshold > lower_threshold)
      );
    `);
    console.log('✅ Tanks table created');

    // Create indexes on tanks table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tanks_user_id ON tanks(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tanks_device_id ON tanks(device_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tanks_saviour_id ON tanks(saviour_id);
    `);

    // Create complaints table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL CHECK (char_length(comment) >= 10 AND char_length(comment) <= 1000),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Complaints table created');

    // Create indexes on complaints table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
    `);

    // Create service_engineers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_engineers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        contact_number VARCHAR(10) NOT NULL CHECK (contact_number ~ '^\\d{10}$'),
        pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^\\d{6}$'),
        address TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Service engineers table created');

    // Create indexes on service_engineers table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_service_engineers_email ON service_engineers(email);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_service_engineers_pincode ON service_engineers(pincode);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_service_engineers_status ON service_engineers(status);
    `);

    // Create trigger to update updated_at timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_user_device_updated_at ON user_device;
      CREATE TRIGGER update_user_device_updated_at
        BEFORE UPDATE ON user_device
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
      CREATE TRIGGER update_plans_updated_at
        BEFORE UPDATE ON plans
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_cities_updated_at ON cities;
      CREATE TRIGGER update_cities_updated_at
        BEFORE UPDATE ON cities
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
      CREATE TRIGGER update_subscriptions_updated_at
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_tanks_updated_at ON tanks;
      CREATE TRIGGER update_tanks_updated_at
        BEFORE UPDATE ON tanks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_complaints_updated_at ON complaints;
      CREATE TRIGGER update_complaints_updated_at
        BEFORE UPDATE ON complaints
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_service_engineers_updated_at ON service_engineers;
      CREATE TRIGGER update_service_engineers_updated_at
        BEFORE UPDATE ON service_engineers
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Database triggers created');

    // Insert sample admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const adminResult = await pool.query(`
      INSERT INTO users (name, email, phone, password, role, access_level, status, noofsecuser)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, ['Admin User', 'admin@gmail.com', '9999999999', adminPassword, 'admin', 'full', 'active', 5]);
    
    if (adminResult.rows.length > 0) {
      const adminId = adminResult.rows[0].id;
      // Insert admin device
      await pool.query(`
        INSERT INTO user_device (user_id, device_id, saviour, house_type, sensor_type, is_primary)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, device_id) DO NOTHING;
      `, [adminId, 'ADMIN-DEVICE-001', 'saviour', 'apartment', 'sensortype1', true]);
    }
    console.log('✅ Sample admin user created (email: admin@gmail.com, password: admin123)');

    // Insert sample regular user (password: user123)
    const userPassword = await bcrypt.hash('user123', 10);
    
    const userResult = await pool.query(`
      INSERT INTO users (name, email, phone, password, role, access_level, status, noofsecuser)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, ['Regular User', 'user@gmail.com', '8888888888', userPassword, 'user', 'limited', 'active', 3]);
    
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      // Insert user device
      await pool.query(`
        INSERT INTO user_device (user_id, device_id, saviour, house_type, sensor_type, is_primary)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, device_id) DO NOTHING;
      `, [userId, 'USER-DEVICE-001', 'ni-sensu', 'villa', 'sensortype2', true]);
    }
    console.log('✅ Sample regular user created (email: user@digit.com, password: user123)');

    // Insert sample plans
    const samplePlans = [
      { plan: 'Premium', profile: 'Saviour', period: 'Monthly', amount: 100 },
      { plan: 'Premium', profile: 'Saviour', period: 'Quarterly', amount: 280 },
      { plan: 'Premium', profile: 'Saviour', period: 'Half Yearly', amount: 550 },
      { plan: 'Premium', profile: 'Saviour', period: 'Yearly', amount: 1000 },
      { plan: 'Premium', profile: 'Ni-Sensu', period: 'Monthly', amount: 50 },
      { plan: 'Premium', profile: 'Ni-Sensu', period: 'Quarterly', amount: 140 },
      { plan: 'Premium', profile: 'Ni-Sensu', period: 'Half Yearly', amount: 270 },
      { plan: 'Premium', profile: 'Ni-Sensu', period: 'Yearly', amount: 500 },
      { plan: 'Premium', profile: 'Smart Jar', period: 'Monthly', amount: 150 },
      { plan: 'Premium', profile: 'Smart Jar', period: 'Quarterly', amount: 420 },
      { plan: 'Premium', profile: 'Smart Jar', period: 'Half Yearly', amount: 800 },
      { plan: 'Premium', profile: 'Smart Jar', period: 'Yearly', amount: 1500 }
    ];

    for (const planData of samplePlans) {
      await pool.query(`
        INSERT INTO plans (plan, profile, period, amount)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (plan, profile, period) DO NOTHING;
      `, [planData.plan, planData.profile, planData.period, planData.amount]);
    }
    console.log('✅ Sample plans created');

    // Insert sample cities
    const sampleCities = [
      { name: 'Mumbai', state: 'Maharashtra', status: 'active' },
      { name: 'Delhi', state: 'Delhi', status: 'active' },
      { name: 'Bangalore', state: 'Karnataka', status: 'active' },
      { name: 'Chennai', state: 'Tamil Nadu', status: 'active' },
      { name: 'Kolkata', state: 'West Bengal', status: 'active' },
      { name: 'Hyderabad', state: 'Telangana', status: 'active' },
      { name: 'Pune', state: 'Maharashtra', status: 'active' },
      { name: 'Ahmedabad', state: 'Gujarat', status: 'active' },
      { name: 'Jaipur', state: 'Rajasthan', status: 'active' },
      { name: 'Lucknow', state: 'Uttar Pradesh', status: 'active' }
    ];

    for (const cityData of sampleCities) {
      await pool.query(`
        INSERT INTO cities (name, state, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (name, state) DO NOTHING;
      `, [cityData.name, cityData.state, cityData.status]);
    }
    console.log('✅ Sample cities created');

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📝 Sample Credentials:');
    console.log('   Admin: admin@digit.com / admin123');
    console.log('   User:  user@digit.com / user123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
