# IoT Service

IoT Service for DIGIT platform provides comprehensive IoT device management and data collection capabilities with MQTT support. This service enables seamless integration of IoT devices, real-time data ingestion via MQTT, and RESTful APIs for device and data management.

## Features

- **Device Management**: Register, update, and manage IoT devices
- **MQTT Integration**: Real-time data ingestion from IoT devices via MQTT
- **Data Storage**: Persistent storage of IoT device data in PostgreSQL
- **RESTful APIs**: Comprehensive REST endpoints for device and data operations
- **Multi-tenancy**: Support for multiple tenants
- **Real-time Communication**: Publish commands and data to devices via MQTT
- **Query Capabilities**: Search and filter device data with time-range queries
- **Scalable Architecture**: Built on Spring Boot with Spring Integration

## Architecture

```
┌─────────────┐         MQTT          ┌──────────────┐
│ IoT Devices │◄─────────────────────►│ MQTT Broker  │
└─────────────┘                        └──────┬───────┘
                                              │
                                              │ Subscribe/Publish
                                              │
                                       ┌──────▼────────┐
                                       │  IoT Service  │
                                       │  (Spring Boot)│
                                       └──────┬────────┘
                                              │
                                              │ REST APIs
                                              │
                                       ┌──────▼────────┐
                                       │  PostgreSQL   │
                                       │   Database    │
                                       └───────────────┘
```

## Service Dependencies

- PostgreSQL Database
- MQTT Broker (e.g., Mosquitto, HiveMQ, AWS IoT Core)
- egov-tracer (for distributed tracing)

## Technology Stack

- **Framework**: Spring Boot 3.2.2
- **Language**: Java 17
- **Database**: PostgreSQL
- **MQTT**: Eclipse Paho MQTT Client
- **Integration**: Spring Integration MQTT
- **ORM**: Spring Data JPA / Hibernate
- **Migration**: Flyway
- **Build Tool**: Maven

## API Endpoints

### Device Management APIs

#### 1. Register Device
**POST** `/iot-service/iot/v1/devices/_register`

Register a new IoT device in the system.

**Request Body:**
```json
{
  "RequestInfo": {},
  "Device": {
    "deviceId": "DEVICE001",
    "deviceName": "Temperature Sensor 1",
    "deviceType": "TEMPERATURE_SENSOR",
    "location": "Farm Block A",
    "status": "ACTIVE",
    "tenantId": "pb.amritsar",
    "metadata": "{\"model\":\"DHT22\",\"version\":\"1.0\"}"
  }
}
```

#### 2. Update Device
**POST** `/iot-service/iot/v1/devices/_update`

Update existing device information.

#### 3. Get Device
**GET** `/iot-service/iot/v1/devices/{deviceId}`

Retrieve device details by device ID.

#### 4. Search Devices
**GET** `/iot-service/iot/v1/devices/_search?tenantId={tenantId}&deviceType={type}&status={status}`

Search devices with filters.

#### 5. Update Device Status
**POST** `/iot-service/iot/v1/devices/{deviceId}/_updateStatus?status={status}`

Update device status (ACTIVE, INACTIVE, MAINTENANCE).

#### 6. Delete Device
**DELETE** `/iot-service/iot/v1/devices/{deviceId}`

Delete a device from the system.

### Data Management APIs

#### 1. Create IoT Data
**POST** `/iot-service/iot/v1/data/_create`

Store IoT data via REST API.

**Request Body:**
```json
{
  "RequestInfo": {},
  "Data": {
    "deviceId": "DEVICE001",
    "dataType": "SENSOR",
    "payload": "{\"temperature\":25.5,\"humidity\":60}",
    "tenantId": "pb.amritsar",
    "source": "REST"
  }
}
```

#### 2. Bulk Create IoT Data
**POST** `/iot-service/iot/v1/data/_bulkCreate`

Store multiple IoT data records in a single request.

#### 3. Search IoT Data
**GET** `/iot-service/iot/v1/data/_search?deviceId={deviceId}&startTime={start}&endTime={end}&page=0&size=10`

Search and retrieve IoT data with filters and pagination.

#### 4. Get Latest Data
**GET** `/iot-service/iot/v1/data/{deviceId}/_latest?limit=10`

Retrieve the latest N records for a device.

#### 5. Publish to Device
**POST** `/iot-service/iot/v1/data/{deviceId}/_publish`

Publish data to a device via MQTT.

#### 6. Send Command to Device
**POST** `/iot-service/iot/v1/data/{deviceId}/_command`

Send a command to a device via MQTT.

## MQTT Integration

### MQTT Topics

The service uses the following MQTT topic structure:

- **Device Data**: `iot/devices/{deviceId}/data`
- **Device Commands**: `iot/devices/{deviceId}/commands`
- **Device Status**: `iot/devices/{deviceId}/status`

### MQTT Configuration

Configure MQTT broker connection in `application.properties`:

```properties
mqtt.broker.url=tcp://localhost:1883
mqtt.client.id=iot-service-client
mqtt.username=your-username
mqtt.password=your-password
mqtt.default.topic=iot/devices/+/data
mqtt.qos=1
```

### Publishing Data from IoT Devices

IoT devices should publish data to the topic: `iot/devices/{deviceId}/data`

**Example Payload:**
```json
{
  "temperature": 25.5,
  "humidity": 60,
  "timestamp": "2025-11-09T12:00:00Z"
}
```

## Database Schema

### iot_device Table
- `id`: Primary key
- `device_id`: Unique device identifier
- `device_name`: Device name
- `device_type`: Type of device
- `location`: Physical location
- `status`: Device status (ACTIVE, INACTIVE, MAINTENANCE)
- `tenant_id`: Tenant identifier
- `metadata`: Additional metadata (JSON)
- `created_at`, `updated_at`: Timestamps
- `created_by`, `updated_by`: Audit fields

### iot_data Table
- `id`: Primary key
- `device_id`: Reference to device
- `data_type`: Type of data (SENSOR, TELEMETRY, COMMAND, EVENT)
- `payload`: Actual data (JSON/Text)
- `timestamp`: Data timestamp
- `tenant_id`: Tenant identifier
- `source`: Data source (MQTT, REST, WEBHOOK)
- `metadata`: Additional metadata
- `created_at`: Creation timestamp

## Setup and Installation

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- MQTT Broker (Mosquitto, HiveMQ, etc.)

### Local Development Setup

1. **Clone the repository**
```bash
cd core-services/iot-service
```

2. **Configure Database**

Create a PostgreSQL database:
```sql
CREATE DATABASE iotdb;
```

Update `application.properties` with your database credentials.

3. **Configure MQTT Broker**

Install and start Mosquitto (or use existing MQTT broker):
```bash
# macOS
brew install mosquitto
brew services start mosquitto

# Ubuntu
sudo apt-get install mosquitto
sudo systemctl start mosquitto
```

Update MQTT configuration in `application.properties`.

4. **Build the Project**
```bash
mvn clean install
```

5. **Run the Application**
```bash
mvn spring-boot:run
```

The service will start on `http://localhost:8084/iot-service`

### Docker Deployment

Build and run using Docker:

```bash
# Build
docker build -t iot-service:latest .

# Run
docker run -p 8084:8084 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/iotdb \
  -e MQTT_BROKER_URL=tcp://host.docker.internal:1883 \
  iot-service:latest
```

## Testing

### Test Device Registration

```bash
curl -X POST http://localhost:8084/iot-service/iot/v1/devices/_register \
  -H "Content-Type: application/json" \
  -d '{
    "RequestInfo": {},
    "Device": {
      "deviceId": "SENSOR001",
      "deviceName": "Temperature Sensor",
      "deviceType": "TEMPERATURE",
      "status": "ACTIVE",
      "tenantId": "pb.amritsar"
    }
  }'
```

### Test MQTT Publishing

```bash
# Publish test data to MQTT broker
mosquitto_pub -h localhost -t "iot/devices/SENSOR001/data" \
  -m '{"temperature":25.5,"humidity":60}'
```

### Test Data Retrieval

```bash
curl http://localhost:8084/iot-service/iot/v1/data/_search?deviceId=SENSOR001
```

## Configuration

### Key Configuration Properties

| Property | Description | Default |
|----------|-------------|---------|
| `server.port` | Service port | 8084 |
| `mqtt.broker.url` | MQTT broker URL | tcp://localhost:1883 |
| `mqtt.client.id` | MQTT client ID | iot-service-client |
| `mqtt.default.topic` | Default subscription topic | iot/devices/+/data |
| `mqtt.qos` | MQTT Quality of Service | 1 |
| `spring.datasource.url` | Database URL | jdbc:postgresql://localhost:5432/iotdb |

## Monitoring and Health

### Health Check

```bash
curl http://localhost:8084/iot-service/health
```

### Metrics

```bash
curl http://localhost:8084/iot-service/metrics
```

## Best Practices

1. **Device ID Naming**: Use consistent, unique device IDs
2. **Data Payload**: Use JSON format for structured data
3. **MQTT QoS**: Use QoS 1 for reliable message delivery
4. **Tenant Isolation**: Always include tenantId for multi-tenant deployments
5. **Data Retention**: Implement data archival for old IoT data
6. **Security**: Use TLS/SSL for MQTT connections in production
7. **Monitoring**: Monitor MQTT connection status and message rates

## Troubleshooting

### MQTT Connection Issues

- Verify MQTT broker is running
- Check firewall rules for port 1883
- Validate MQTT credentials

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify database credentials
- Check Flyway migration status

### Performance Issues

- Add indexes for frequently queried fields
- Implement data partitioning for large datasets
- Use pagination for data retrieval

## Future Enhancements

- [ ] WebSocket support for real-time data streaming
- [ ] Device authentication and authorization
- [ ] Data aggregation and analytics
- [ ] Alert and notification system
- [ ] Device firmware management
- [ ] Support for multiple MQTT brokers
- [ ] Data encryption at rest

## Contributing

Follow the DIGIT platform contribution guidelines.

## License

Licensed under the same terms as the DIGIT platform.

## Support

For issues and questions, please refer to the DIGIT platform documentation or raise an issue in the repository.
