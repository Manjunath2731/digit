# Changelog

All notable changes to the IoT Service will be documented in this file.

## [1.0.0] - 2025-11-09

### Added
- Initial release of IoT Service for DIGIT platform
- Device management APIs (register, update, search, delete)
- IoT data storage and retrieval APIs
- MQTT integration for real-time data ingestion
- MQTT publish capabilities for device commands
- PostgreSQL database integration with Flyway migrations
- Multi-tenancy support
- RESTful API endpoints following DIGIT conventions
- Comprehensive device and data models
- Spring Integration MQTT support
- Pagination support for data queries
- Time-range based data filtering
- Device status management
- Bulk data creation support

### Features
- **Device Management**
  - Register new IoT devices
  - Update device information
  - Search devices by tenant, type, or status
  - Delete devices
  - Update device status

- **Data Management**
  - Store IoT data via REST API
  - Bulk data creation
  - Search data with filters
  - Time-range queries
  - Latest data retrieval
  - Pagination support

- **MQTT Integration**
  - Subscribe to device data topics
  - Publish commands to devices
  - Automatic data persistence from MQTT messages
  - Configurable QoS and topics

### Database Schema
- `iot_device` table for device information
- `iot_data` table for IoT telemetry data
- Indexes for optimized queries
- Flyway migrations for version control

### Configuration
- MQTT broker configuration
- Database connection settings
- Multi-tenancy support
- Timezone configuration
