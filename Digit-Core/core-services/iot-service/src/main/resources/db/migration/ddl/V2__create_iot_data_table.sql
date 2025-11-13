-- Create iot_data table
CREATE TABLE IF NOT EXISTS iot_data (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    data_type VARCHAR(100),
    payload TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tenant_id VARCHAR(255),
    source VARCHAR(50),
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_iot_data_device_id ON iot_data(device_id);
CREATE INDEX idx_iot_data_timestamp ON iot_data(timestamp DESC);
CREATE INDEX idx_iot_data_device_timestamp ON iot_data(device_id, timestamp DESC);
CREATE INDEX idx_iot_data_tenant_id ON iot_data(tenant_id);
CREATE INDEX idx_iot_data_data_type ON iot_data(data_type);
CREATE INDEX idx_iot_data_source ON iot_data(source);

-- Add comments
COMMENT ON TABLE iot_data IS 'Table to store IoT device data and telemetry';
COMMENT ON COLUMN iot_data.device_id IS 'Reference to the device that generated this data';
COMMENT ON COLUMN iot_data.data_type IS 'Type of data (SENSOR, TELEMETRY, COMMAND, EVENT)';
COMMENT ON COLUMN iot_data.payload IS 'Actual data payload in JSON or text format';
COMMENT ON COLUMN iot_data.timestamp IS 'Timestamp when the data was generated';
COMMENT ON COLUMN iot_data.tenant_id IS 'Tenant identifier for multi-tenancy support';
COMMENT ON COLUMN iot_data.source IS 'Source of the data (MQTT, REST, WEBHOOK)';
COMMENT ON COLUMN iot_data.metadata IS 'Additional metadata in JSON format';

-- Create partition for better performance (optional, for large datasets)
-- This is commented out by default, uncomment if needed
-- CREATE TABLE iot_data_y2025m01 PARTITION OF iot_data
--     FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
