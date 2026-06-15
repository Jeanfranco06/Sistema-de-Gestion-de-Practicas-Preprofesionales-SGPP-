# ===============================================
# Build stage
# ===============================================
FROM node:20-alpine AS build
WORKDIR /app

# Set environment variable for Vite (ruta relativa para proxy)
ENV VITE_API_BASE_URL="/api/v1"

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ===============================================
# Run stage - use nginx to serve static files
# ===============================================
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
