-- V1__init_schema.sql
-- Initial database schema for Digit Service

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(10) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'secondary_user')),
    access_level VARCHAR(50) DEFAULT 'limited' CHECK (access_level IN ('full', 'limited', 'view_only')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    noofsecuser INTEGER DEFAULT 0,
    address TEXT,
    addressdetails JSONB,
    last_login_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role);

-- Create user_device table
CREATE TABLE IF NOT EXISTS user_device (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    saviour VARCHAR(50),
    device_sim_no VARCHAR(20),
    house_type VARCHAR(50),
    sensor_type VARCHAR(50),
    last_login_device VARCHAR(255),
    os VARCHAR(100),
    browser VARCHAR(100),
    is_primary BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_id)
);

-- Create indexes for user_device table
CREATE INDEX IF NOT EXISTS idx_user_device_user_id ON user_device(user_id);
CREATE INDEX IF NOT EXISTS idx_user_device_device_id ON user_device(device_id);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
    id BIGSERIAL PRIMARY KEY,
    plan VARCHAR(100) NOT NULL,
    profile VARCHAR(50) NOT NULL CHECK (profile IN ('Saviour', 'Ni-Sensu', 'Smart Jar')),
    period VARCHAR(50) NOT NULL CHECK (period IN ('Monthly', 'Quarterly', 'Half Yearly', 'Yearly')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan, profile, period)
);

-- Create indexes for plans table
CREATE INDEX IF NOT EXISTS idx_plan_profile ON plans(profile);
CREATE INDEX IF NOT EXISTS idx_plan_period ON plans(period);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, state)
);

-- Create indexes for cities table
CREATE INDEX IF NOT EXISTS idx_city_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_city_state ON cities(state);
CREATE INDEX IF NOT EXISTS idx_city_status ON cities(status);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    period VARCHAR(50) NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscription_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_device_id ON subscriptions(device_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_end_date ON subscriptions(end_date);

-- Create tanks table
CREATE TABLE IF NOT EXISTS tanks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    saviour_name VARCHAR(100) NOT NULL,
    saviour_id BIGINT NOT NULL,
    saviour_capacity DECIMAL(10, 2) NOT NULL CHECK (saviour_capacity > 0),
    upper_threshold DECIMAL(10, 2) NOT NULL CHECK (upper_threshold > 0),
    lower_threshold DECIMAL(10, 2) NOT NULL CHECK (lower_threshold > 0),
    saviour_height DECIMAL(10, 2) NOT NULL CHECK (saviour_height > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id, user_id),
    CHECK (upper_threshold > lower_threshold)
);

-- Create indexes for tanks table
CREATE INDEX IF NOT EXISTS idx_tank_user_id ON tanks(user_id);
CREATE INDEX IF NOT EXISTS idx_tank_device_id ON tanks(device_id);
CREATE INDEX IF NOT EXISTS idx_tank_saviour_id ON tanks(saviour_id);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL CHECK (char_length(comment) >= 10 AND char_length(comment) <= 1000),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for complaints table
CREATE INDEX IF NOT EXISTS idx_complaint_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaint_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaint_created_at ON complaints(created_at);

-- Create service_engineers table
CREATE TABLE IF NOT EXISTS service_engineers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    contact_number VARCHAR(10) NOT NULL CHECK (contact_number ~ '^\d{10}$'),
    pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^\d{6}$'),
    address TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for service_engineers table
CREATE INDEX IF NOT EXISTS idx_service_engineer_email ON service_engineers(email);
CREATE INDEX IF NOT EXISTS idx_service_engineer_pincode ON service_engineers(pincode);
CREATE INDEX IF NOT EXISTS idx_service_engineer_status ON service_engineers(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_device_updated_at BEFORE UPDATE ON user_device FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tanks_updated_at BEFORE UPDATE ON tanks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_engineers_updated_at BEFORE UPDATE ON service_engineers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
