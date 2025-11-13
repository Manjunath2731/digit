-- V5__reset_user_passwords.sql  
-- Reset passwords for default users with known BCrypt(10) hash

-- Update both users to use password "password"
-- BCrypt(10) hash for 'password': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjBeYNeXALnVctrmy.OWkhuW6NCLu6

UPDATE users
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjBeYNeXALnVctrmy.OWkhuW6NCLu6'
WHERE email IN ('admin@gmail.com', 'user@gmail.com');
