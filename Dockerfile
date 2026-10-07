# Frontend de Chaski Pe (React + Vite) servido con nginx.
# Pensado para Dokploy: Build Type Dockerfile, Build Path /frontend.
#
# La app llama a la API en /backend (mismo dominio) y nginx la reenvia a
# BACKEND_URL. Asi no hay CORS ni contenido mixto, y la direccion del backend
# se cambia en Dokploy sin recompilar.

# --- 1. Compilar ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_API_URL=/backend
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- 2. Servir ---
FROM nginx:1.27-alpine
# La imagen oficial pasa los *.template por envsubst al arrancar.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Direccion interna o publica del backend (sin barra final). Si no responde,
# la app sigue funcionando con datos de ejemplo.
ENV BACKEND_URL=http://127.0.0.1:8000
EXPOSE 80
