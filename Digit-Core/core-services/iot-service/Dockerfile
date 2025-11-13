FROM maven:3.8.6-openjdk-17-slim AS build

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:17-jdk-slim

WORKDIR /opt/egov

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar /opt/egov/iot-service.jar

# Create non-root user
RUN groupadd -r iot && useradd -r -g iot iot
RUN chown -R iot:iot /opt/egov
USER iot

# Expose port
EXPOSE 8084

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8084/iot-service/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "/opt/egov/iot-service.jar"]
