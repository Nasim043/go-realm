# Multi-stage Dockerfile for Go Realm (Next.js + Nextra)

# 1) Install dependencies (including devDependencies for build)
FROM node:22-slim AS deps

WORKDIR /app

# Install dependencies based on lockfile
COPY package.json package-lock.json* ./
RUN npm ci

# 2) Build stage (Next.js build + Pagefind postbuild)
FROM node:22-slim AS builder

WORKDIR /app

ENV NODE_ENV=production

# Reuse node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Build the Next.js app (this also runs the postbuild script for Pagefind)
RUN npm run build

# 3) Runtime stage (minimal production image)
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4300

# Copy only what is needed at runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/mdx-components.js ./mdx-components.js
COPY package.json package-lock.json* ./

# Install only production dependencies (no devDependencies)
RUN npm ci --omit=dev

EXPOSE 4300

# Use the existing npm start script (next start -p 4300)
CMD ["npm", "start"]