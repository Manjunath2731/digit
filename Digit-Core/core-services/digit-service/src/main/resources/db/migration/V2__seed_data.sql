-- V2__seed_data.sql
-- Seed data for Digit Service

-- Insert default admin user (password: admin123)
-- BCrypt hash for 'admin123'
INSERT INTO users (name, email, phone, password, role, access_level, status)
VALUES ('Admin User', 'admin@gmail.com', '9999999999', '$2a$10$N9qo8uLOickgx2ZMRZoMye7VsQV5H/hqnF3X8FQbXKUuP1BwBXhXm', 'admin', 'full', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert default user (password: user123)
-- BCrypt hash for 'user123'
INSERT INTO users (name, email, phone, password, role, access_level, status)
VALUES ('Test User', 'user@gmail.com', '8888888888', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG13AHsdUhKZQqa1we', 'user', 'limited', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample subscription plans
INSERT INTO plans (plan, profile, period, amount) VALUES
('Basic Plan', 'Saviour', 'Monthly', 99.00),
('Basic Plan', 'Saviour', 'Quarterly', 270.00),
('Basic Plan', 'Saviour', 'Half Yearly', 510.00),
('Basic Plan', 'Saviour', 'Yearly', 990.00),
('Premium Plan', 'Ni-Sensu', 'Monthly', 149.00),
('Premium Plan', 'Ni-Sensu', 'Quarterly', 420.00),
('Premium Plan', 'Ni-Sensu', 'Half Yearly', 810.00),
('Premium Plan', 'Ni-Sensu', 'Yearly', 1590.00),
('Enterprise Plan', 'Smart Jar', 'Monthly', 199.00),
('Enterprise Plan', 'Smart Jar', 'Quarterly', 570.00),
('Enterprise Plan', 'Smart Jar', 'Half Yearly', 1110.00),
('Enterprise Plan', 'Smart Jar', 'Yearly', 2190.00)
ON CONFLICT (plan, profile, period) DO NOTHING;

-- Insert sample cities
INSERT INTO cities (name, state, status) VALUES
('Mumbai', 'Maharashtra', 'active'),
('Delhi', 'Delhi', 'active'),
('Bangalore', 'Karnataka', 'active'),
('Hyderabad', 'Telangana', 'active'),
('Chennai', 'Tamil Nadu', 'active'),
('Kolkata', 'West Bengal', 'active'),
('Pune', 'Maharashtra', 'active'),
('Ahmedabad', 'Gujarat', 'active'),
('Jaipur', 'Rajasthan', 'active'),
('Lucknow', 'Uttar Pradesh', 'active')
ON CONFLICT (name, state) DO NOTHING;
