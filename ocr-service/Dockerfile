# --- Etapa de build: compila el jar con Maven ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Cacheamos dependencias: primero el pom, luego el código.
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# Copy source code and build
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# --- Etapa de runtime: imagen con JRE + Tesseract ---
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install Tesseract OCR and Spanish language pack
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-spa \
    && rm -rf /var/lib/apt/lists/*

# Copy the built jar
COPY --from=build /app/target/*.jar app.jar

# Set environment variables
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
