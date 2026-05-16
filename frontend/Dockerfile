# Étape 1 : Construction (Build)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Compile le projet Angular en mode production
RUN npm run build -- --configuration production

# Étape 2 : Serveur Nginx (Run)
FROM nginx:alpine
# Copie la configuration Nginx pour gérer le routage d'Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copie les fichiers compilés d'Angular (Angular 17+ place les fichiers dans dist/frontend/browser)
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
