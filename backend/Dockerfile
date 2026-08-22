# ============================================================
# Portfolio Backend — Production Dockerfile
# Multi-stage build: dependencies → runtime
# ============================================================

# ------------------------------------------------------------
# Stage 1: Install dependencies and generate Prisma Client
# ------------------------------------------------------------
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install production dependencies only (no devDependencies)
RUN npm ci --omit=dev

# ------------------------------------------------------------
# Stage 2: Build stage for Prisma Client generation
# ------------------------------------------------------------
FROM node:20-alpine AS prisma

WORKDIR /app

# Copy dependency manifests and install ALL dependencies (including dev for prisma)
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# ------------------------------------------------------------
# Stage 3: Production runtime
# ------------------------------------------------------------
FROM node:20-alpine AS runtime

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy production dependencies from builder stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy generated Prisma Client
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source
COPY src ./src
COPY prisma ./prisma

# Create uploads directory for local storage
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose backend port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/api/v1/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

# Start the Express server
CMD ["node", "src/server.js"]
