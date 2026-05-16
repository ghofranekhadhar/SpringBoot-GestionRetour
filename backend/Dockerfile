# Étape 1 : Construction (Build)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Télécharge les dépendances en cache (pour accélérer les builds suivants)
RUN mvn dependency:go-offline -B
COPY src ./src
# Compile et package le projet (sans jouer les tests pour le déploiement)
RUN mvn clean package -DskipTests

# Étape 2 : Exécution (Run)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Le backend tourne sur le port 8081
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
