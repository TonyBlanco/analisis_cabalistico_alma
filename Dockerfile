# Dockerfile
FROM node:20

WORKDIR /app

# Copiar solo package.json primero
COPY package*.json ./

# Debug: Ver qué hay en package.json
RUN cat package.json

# Instalar dependencias
RUN npm install

# Copiar el resto
COPY . .

# Debug: Listar archivos
RUN ls -la

# Intentar build con más output
RUN npm run build || (echo "=== ERROR EN BUILD ===" && \
    echo "Node version:" && node --version && \
    echo "NPM version:" && npm --version && \
    echo "Package.json scripts:" && cat package.json | grep -A 10 scripts && \
    exit 1)

EXPOSE 3000
CMD ["npm", "start"]