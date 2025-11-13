# Local Setup Guide - IoT Service

This guide will help you set up the IoT Service on your local machine for development and testing.

## Prerequisites

- **Java Development Kit (JDK) 17** or higher
- **Apache Maven 3.6+**
- **PostgreSQL 12+**
- **MQTT Broker** (Mosquitto recommended)
- **Git**
- **IDE** (IntelliJ IDEA, Eclipse, or VS Code)

## Step-by-Step Setup

### 1. Install Prerequisites

#### Install Java 17

**macOS:**
```bash
brew install openjdk@17
```

**Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install openjdk-17-jdk
```

Verify installation:
```bash
java -version
```

#### Install Maven

**macOS:**
```bash
brew install maven
```

**Ubuntu:**
```bash
sudo apt-get install maven
```

Verify installation:
```bash
mvn -version
```

#### Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Install Mosquitto MQTT Broker

**macOS:**
```bash
brew install mosquitto
brew services start mosquitto
```

**Ubuntu:**
```bash
sudo apt-get install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

Verify Mosquitto is running:
```bash
mosquitto -v
```

### 2. Database Setup

Create the database and user:

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE iotdb;

# Create user (if needed)
CREATE USER iotuser WITH PASSWORD 'iotpassword';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE iotdb TO iotuser;

# Exit
\q
```

### 3. Clone and Configure

Navigate to the service directory:
```bash
cd /path/to/core-services/iot-service
```

### 4. Configure Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/iotdb
spring.datasource.username=postgres
spring.datasource.password=postgres

# MQTT Configuration
mqtt.broker.url=tcp://localhost:1883
mqtt.client.id=iot-service-client-local
mqtt.username=
mqtt.password=
```

### 5. Build the Project

```bash
mvn clean install
```

This will:
- Download all dependencies
- Compile the code
- Run tests
- Create the JAR file

### 6. Run Database Migrations

Flyway will automatically run migrations on startup, but you can verify:

```bash
mvn flyway:info
mvn flyway:migrate
```

### 7. Run the Application

**Option 1: Using Maven**
```bash
mvn spring-boot:run
```

**Option 2: Using JAR**
```bash
java -jar target/iot-service-1.0.0-SNAPSHOT.jar
```

**Option 3: Using IDE**
- Open the project in your IDE
- Run `IotServiceApplication.java` as a Java Application

The service will start on `http://localhost:8084/iot-service`

### 8. Verify the Service

#### Health Check
```bash
curl http://localhost:8084/iot-service/health
```

Expected response:
```json
{
  "status": "UP"
}
```

### 9. Test the APIs

#### Register a Device

```bash
curl -X POST http://localhost:8084/iot-service/iot/v1/devices/_register \
  -H "Content-Type: application/json" \
  -d '{
    "RequestInfo": {},
    "Device": {
      "deviceId": "TEST_DEVICE_001",
      "deviceName": "Test Temperature Sensor",
      "deviceType": "TEMPERATURE_SENSOR",
      "location": "Lab Room 1",
      "status": "ACTIVE",
      "tenantId": "pb.amritsar",
      "metadata": "{\"model\":\"DHT22\"}"
    }
  }'
```

#### Get Device

```bash
curl http://localhost:8084/iot-service/iot/v1/devices/TEST_DEVICE_001
```

#### Create IoT Data

```bash
curl -X POST http://localhost:8084/iot-service/iot/v1/data/_create \
  -H "Content-Type: application/json" \
  -d '{
    "RequestInfo": {},
    "Data": {
      "deviceId": "TEST_DEVICE_001",
      "dataType": "SENSOR",
      "payload": "{\"temperature\":25.5,\"humidity\":60}",
      "tenantId": "pb.amritsar",
      "source": "REST"
    }
  }'
```

#### Search Data

```bash
curl "http://localhost:8084/iot-service/iot/v1/data/_search?deviceId=TEST_DEVICE_001&page=0&size=10"
```

### 10. Test MQTT Integration

#### Subscribe to MQTT Topic (Terminal 1)

```bash
mosquitto_sub -h localhost -t "iot/devices/+/data" -v
```

#### Publish Test Data (Terminal 2)

```bash
mosquitto_pub -h localhost -t "iot/devices/TEST_DEVICE_001/data" \
  -m '{"temperature":26.5,"humidity":65,"timestamp":"2025-11-09T12:00:00Z"}'
```

Check the database to verify data was stored:

```bash
psql -d iotdb -c "SELECT * FROM iot_data ORDER BY created_at DESC LIMIT 5;"
```

### 11. Development Tips

#### Hot Reload with Spring DevTools

The project includes `spring-boot-devtools` for automatic restart on code changes.

#### Debug Mode

Run with debug enabled:
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

Then attach your IDE debugger to port 5005.

#### View Logs

Logs are printed to console. To save to file:
```bash
mvn spring-boot:run > app.log 2>&1
```

#### Database Console

Access PostgreSQL:
```bash
psql -d iotdb -U postgres
```

Useful queries:
```sql
-- View all devices
SELECT * FROM iot_device;

-- View recent data
SELECT * FROM iot_data ORDER BY timestamp DESC LIMIT 10;

-- Count data by device
SELECT device_id, COUNT(*) FROM iot_data GROUP BY device_id;
```

## Troubleshooting

### Port Already in Use

If port 8084 is already in use:
```bash
# Find process using port
lsof -i :8084

# Kill process
kill -9 <PID>

# Or change port in application.properties
server.port=8085
```

### Database Connection Error

- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `application.properties`
- Ensure database exists: `psql -l`

### MQTT Connection Error

- Verify Mosquitto is running: `brew services list` (macOS) or `systemctl status mosquitto` (Linux)
- Check MQTT broker URL in `application.properties`
- Test MQTT connection: `mosquitto_pub -h localhost -t test -m "hello"`

### Flyway Migration Errors

Reset Flyway if needed:
```bash
mvn flyway:clean
mvn flyway:migrate
```

### Maven Build Errors

Clear Maven cache:
```bash
mvn clean
rm -rf ~/.m2/repository
mvn install
```

## IDE Setup

### IntelliJ IDEA

1. Open the project: `File > Open` → Select `iot-service` folder
2. Wait for Maven to import dependencies
3. Install Lombok plugin: `Preferences > Plugins > Search "Lombok"`
4. Enable annotation processing: `Preferences > Build > Compiler > Annotation Processors`
5. Run `IotServiceApplication` class

### Eclipse

1. Import as Maven project: `File > Import > Maven > Existing Maven Projects`
2. Install Lombok: Download `lombok.jar` and run `java -jar lombok.jar`
3. Right-click project > `Run As > Spring Boot App`

### VS Code

1. Install extensions:
   - Java Extension Pack
   - Spring Boot Extension Pack
   - Lombok Annotations Support
2. Open folder in VS Code
3. Run using Spring Boot Dashboard

## Next Steps

1. Explore the API documentation in `README.md`
2. Review the code structure
3. Add custom device types
4. Implement data validation
5. Add custom MQTT topics
6. Integrate with other DIGIT services

## Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Integration MQTT](https://docs.spring.io/spring-integration/reference/mqtt.html)
- [Eclipse Paho MQTT](https://www.eclipse.org/paho/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Mosquitto MQTT Broker](https://mosquitto.org/)
