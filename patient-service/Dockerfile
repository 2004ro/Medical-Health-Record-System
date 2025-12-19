ARG JAVA_VERSION=21
ARG MAVEN_VERSION=3.9
ARG JAR_FILE=patient-service-1.0.0.jar

FROM maven:${MAVEN_VERSION}-eclipse-temurin-${JAVA_VERSION} AS builder
ARG JAR_FILE

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src src

RUN mvn clean package -DskipTests

# Verify JAR exists to catch build failures early
RUN test -f target/${JAR_FILE} || (echo "JAR file not found" && exit 1)

FROM eclipse-temurin:${JAVA_VERSION}-jre
ARG JAR_FILE

WORKDIR /app

COPY --from=builder /app/target/${JAR_FILE} app.jar

# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash appuser
USER appuser

EXPOSE 8085

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8085/api/v1/patients/health/check || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
CMD []