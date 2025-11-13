-- V7__clear_all_data.sql
-- Clear all existing data from all tables

-- Delete in order to respect foreign key constraints
DELETE FROM password_reset_tokens;
DELETE FROM complaints;
DELETE FROM tanks;
DELETE FROM subscriptions;
DELETE FROM user_device;
DELETE FROM users;
DELETE FROM plans;
DELETE FROM cities;
DELETE FROM service_engineers;

-- Reset sequences to start from 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE user_device_id_seq RESTART WITH 1;
ALTER SEQUENCE plans_id_seq RESTART WITH 1;
ALTER SEQUENCE cities_id_seq RESTART WITH 1;
ALTER SEQUENCE subscriptions_id_seq RESTART WITH 1;
ALTER SEQUENCE tanks_id_seq RESTART WITH 1;
ALTER SEQUENCE complaints_id_seq RESTART WITH 1;
ALTER SEQUENCE service_engineers_id_seq RESTART WITH 1;
ALTER SEQUENCE password_reset_tokens_id_seq RESTART WITH 1;