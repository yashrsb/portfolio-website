# ============================================================
# Portfolio Backend — Production Dockerfile
# Multi-stage build: dependencies → runtime
# ============================================================

# ------------------------------------------------------------
# Stage 1: Install dependencies and generate Prisma Client
# ------------------------------------------------------------
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install production dependencies only (no devDependencies)
# --ignore-scripts: skip postinstall (prisma generate) — Prisma Client is
# generated separately in the prisma stage where the schema is available.
RUN npm ci --omit=dev --ignore-scripts

# ------------------------------------------------------------
# Stage 2: Build stage for Prisma Client generation
# ------------------------------------------------------------
FROM node:22-alpine AS prisma

WORKDIR /app

# Copy dependency manifests and install ALL dependencies (including dev for prisma)
# --ignore-scripts: skip postinstall (prisma generate) — schema is copied next.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma Client
# DATABASE_URL is required by Prisma 7.x even for generate; use a dummy value
# since no database connection is needed to generate the client code.
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# ------------------------------------------------------------
# Stage 3: Production runtime
# ------------------------------------------------------------
FROM node:22-alpine AS runtime

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy production dependencies from builder stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy generated Prisma Client (custom output path: src/generated/prisma)
COPY --from=prisma /app/src/generated/prisma ./src/generated/prisma
COPY --from=prisma /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source
COPY src ./src
COPY prisma ./prisma
COPY prisma.config.ts ./

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
