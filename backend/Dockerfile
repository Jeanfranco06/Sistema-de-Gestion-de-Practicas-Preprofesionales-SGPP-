# ===============================================
# Build stage
# ===============================================
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy parent pom first
COPY pom.xml .
COPY sgpp-shared/pom.xml ./sgpp-shared/
COPY sgpp-core/pom.xml ./sgpp-core/
COPY sgpp-api/pom.xml ./sgpp-api/

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY sgpp-shared/src ./sgpp-shared/src
COPY sgpp-core/src ./sgpp-core/src
COPY sgpp-api/src ./sgpp-api/src

# Build the application
RUN mvn clean package -DskipTests

# ===============================================
# Run stage
# ===============================================
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/sgpp-api/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
