-- V3__fix_column_types.sql
-- Fix all ID columns from INTEGER to BIGINT

-- Disable foreign key checks temporarily
ALTER TABLE user_device DROP CONSTRAINT IF EXISTS user_device_user_id_fkey;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;
ALTER TABLE tanks DROP CONSTRAINT IF EXISTS tanks_user_id_fkey;
ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_user_id_fkey;

-- Alter all ID columns to BIGINT
ALTER TABLE users ALTER COLUMN id TYPE BIGINT;
ALTER TABLE user_device ALTER COLUMN id TYPE BIGINT;
ALTER TABLE user_device ALTER COLUMN user_id TYPE BIGINT;
ALTER TABLE plans ALTER COLUMN id TYPE BIGINT;
ALTER TABLE cities ALTER COLUMN id TYPE BIGINT;
ALTER TABLE subscriptions ALTER COLUMN id TYPE BIGINT;
ALTER TABLE subscriptions ALTER COLUMN user_id TYPE BIGINT;
ALTER TABLE subscriptions ALTER COLUMN plan_id TYPE BIGINT;
ALTER TABLE tanks ALTER COLUMN id TYPE BIGINT;
ALTER TABLE tanks ALTER COLUMN user_id TYPE BIGINT;
ALTER TABLE tanks ALTER COLUMN saviour_id TYPE BIGINT;
ALTER TABLE complaints ALTER COLUMN id TYPE BIGINT;
ALTER TABLE complaints ALTER COLUMN user_id TYPE BIGINT;
ALTER TABLE service_engineers ALTER COLUMN id TYPE BIGINT;

-- Re-add foreign key constraints
ALTER TABLE user_device ADD CONSTRAINT user_device_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_id_fkey 
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT;

ALTER TABLE tanks ADD CONSTRAINT tanks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE complaints ADD CONSTRAINT complaints_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
