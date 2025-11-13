-- V4__update_default_passwords.sql
-- Update default user passwords with correct BCrypt(10) hashes
-- BCrypt hash for 'password': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjBeYNeXALnVctrmy.OWkhuW6NCLu6

-- Delete and recreate admin user (password: password)
DELETE FROM users WHERE email = 'admin@gmail.com';
INSERT INTO users (name, email, phone, password, role, access_level, status, noofsecuser)
VALUES ('Admin User', 'admin@gmail.com', '9999999999', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjBeYNeXALnVctrmy.OWkhuW6NCLu6', 'admin', 'full', 'active', 0);

-- Delete and recreate regular user (password: password)
DELETE FROM users WHERE email = 'user@gmail.com';
INSERT INTO users (name, email, phone, password, role, access_level, status, noofsecuser)
VALUES ('Test User', 'user@gmail.com', '8888888888', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjBeYNeXALnVctrmy.OWkhuW6NCLu6', 'user', 'limited', 'active', 0);
