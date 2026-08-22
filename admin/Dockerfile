# ============================================================
# Portfolio Admin — Production Dockerfile
# Multi-stage build: Node.js build → Nginx runtime
# ============================================================

# ------------------------------------------------------------
# Stage 1: Build the React application
# ------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (leverages Docker layer cache)
COPY package.json package-lock.json ./

# Install dependencies using npm ci for reproducible builds
RUN npm ci

# Copy application source
COPY . .

# Build the production bundle
RUN npm run build

# ------------------------------------------------------------
# Stage 2: Serve static files with Nginx
# ------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d

# Copy built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 3001 (mapped from host)
EXPOSE 3001

# Healthcheck: verify nginx is serving content
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
