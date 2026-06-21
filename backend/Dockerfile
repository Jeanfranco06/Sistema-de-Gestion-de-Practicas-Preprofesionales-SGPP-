FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY sgpp-shared/pom.xml sgpp-shared/
COPY sgpp-core/pom.xml sgpp-core/
COPY sgpp-api/pom.xml sgpp-api/
COPY sgpp-shared/src sgpp-shared/src
COPY sgpp-core/src sgpp-core/src
COPY sgpp-api/src sgpp-api/src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/sgpp-api/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
