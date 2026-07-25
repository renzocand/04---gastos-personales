# --- Etapa de build: compila la app Angular ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# --- Etapa de runtime: nginx sirve los estáticos y proxea /api al backend ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/gastos-personales/browser /usr/share/nginx/html
EXPOSE 80
