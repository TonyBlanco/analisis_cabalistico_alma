# Dockerfile
FROM node:20-alpine AS builder

# Instalar dependencias del sistema necesarias para compilar binarios nativos
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias con logs detallados
RUN npm ci --verbose

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Construir con logs detallados
RUN npm run build --verbose || (echo "Build failed. Listing node_modules:" && ls -la node_modules && exit 1)

# Etapa de producción
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos necesarios desde la etapa de build
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", ".output/server/index.mjs"]