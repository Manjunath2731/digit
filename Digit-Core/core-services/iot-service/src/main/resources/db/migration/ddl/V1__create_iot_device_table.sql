-- Create iot_device table
CREATE TABLE IF NOT EXISTS iot_device (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100),
    location VARCHAR(500),
    status VARCHAR(50),
    tenant_id VARCHAR(255),
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Create indexes
CREATE INDEX idx_iot_device_device_id ON iot_device(device_id);
CREATE INDEX idx_iot_device_tenant_id ON iot_device(tenant_id);
CREATE INDEX idx_iot_device_status ON iot_device(status);
CREATE INDEX idx_iot_device_type ON iot_device(device_type);

-- Add comments
COMMENT ON TABLE iot_device IS 'Table to store IoT device information';
COMMENT ON COLUMN iot_device.device_id IS 'Unique identifier for the device';
COMMENT ON COLUMN iot_device.device_name IS 'Human-readable name of the device';
COMMENT ON COLUMN iot_device.device_type IS 'Type/category of the device';
COMMENT ON COLUMN iot_device.location IS 'Physical location of the device';
COMMENT ON COLUMN iot_device.status IS 'Current status of the device (ACTIVE, INACTIVE, MAINTENANCE)';
COMMENT ON COLUMN iot_device.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN iot_device.metadata IS 'Additional device metadata in JSON format';
