# Système de Gestion des Retours (Sujet 6)

## 📖 Description du Projet
Ce projet est une solution complète (Full-Stack) de **Gestion des Retours Produits**. L'objectif est d'assurer une traçabilité totale et une gestion stricte du flux de retours en entreprise, en respectant les principes d'une architecture propre.

Les fonctionnalités majeures incluent :
- **Gestion des rôles (JWT)** : Clients (CLIENT), Employés (EMPLOYE), Administrateurs (ADMIN) et Service Qualité (QUALITE).
- **Processus de Validation** : Création, Validation, et Rejet de retours avec la mise à jour automatique des stocks.
- **Traçabilité Totale (Audit Trail)** : Historique complet de chaque action (qui, quoi, quand).
- **Dashboard Dynamique** : Vue globale sur les produits, le stock, les retours en attente et l'historique d'activité.

## 🛠️ Technologies Utilisées
### Back-end
- **Java 17** / **Spring Boot 3**
- **Spring Data JPA** & **Hibernate**
- **Spring Security** (Authentification stateless via JWT)
- **Spring Validator** (Intégrité des données)
- **Swagger / OpenAPI** (Documentation interactive de l'API)

### Front-end
- **Angular 17** (Architecture modulaire, RxJS, HttpClient)
- HTML5 / CSS3 (Design UI/UX premium et responsive)

### Base de données & Déploiement
- **PostgreSQL**
- **Docker** & **Docker Compose**
- **Nginx** (Serveur web pour Angular)

## ⚙️ Instructions d'Installation et d'Exécution

Le projet est entièrement "dockerisé" pour garantir un déploiement fiable sur n'importe quelle machine (ou sur une machine virtuelle cloud type Google Cloud Platform).

### 🐳 Déploiement Rapide avec Docker (Recommandé)
Assurez-vous d'avoir [Docker](https://docs.docker.com/get-docker/) et Docker Compose installés.
1. Ouvrez un terminal à la racine du projet (là où se trouve le fichier `docker-compose.yml`).
2. Lancez la commande suivante :
   ```bash
   docker-compose up -d --build
   ```
3. L'application est maintenant en ligne !
   - **L'interface Web (Front-end)** : [http://localhost](http://localhost) (ou sur le port 4200 si vous accédez via http://localhost:4200)
   - **L'API (Back-end)** : L'API répond sur le port 8081.

### 💻 Déploiement en Mode Développement (Local)
Si vous souhaitez exécuter le projet sans Docker (en local pour le code) :
1. **Base de données** : Lancez une instance PostgreSQL locale sur le port 5432 avec l'utilisateur `postgres` et le mot de passe `0`. Créez une base nommée `gestion_retours`.
2. **Back-end** : Allez dans le dossier `backend` et tapez :
   ```bash
   ./mvnw spring-boot:run
   ```
3. **Front-end** : Allez dans le dossier `frontend` et tapez :
   ```bash
   npm install
   npm start
   ```

## 📚 Documentation de l'API (Swagger)
L'intégralité des endpoints REST est documentée et testable directement depuis le navigateur. Une fois le back-end lancé, accédez à la page Swagger UI :
👉 **[http://localhost:8081/api/swagger-ui/index.html](http://localhost:8081/api/swagger-ui/index.html)**

*(Pensez à récupérer un token JWT via la route de connexion et à l'insérer dans le bouton "Authorize" pour pouvoir tester les routes sécurisées).*

## 🔒 Sécurité et Intégrité des données
- L'intégrité est garantie par **Spring Validator** (annotations `@NotNull`, `@Email`, `@Size` présentes dans toutes les entités et contrôleurs via `@Valid`).
- Le système de routage Angular intègre des `Guards` pour interdire l'accès aux pages non autorisées.
- Le backend refuse toute opération sensible non authentifiée.
