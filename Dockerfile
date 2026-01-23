# Multi-stage Dockerfile for Go Realm (Next.js + Nextra)
# Optimized for fast rebuilds with BuildKit cache

# 1) Install dependencies (including devDependencies for build)
FROM node:22-slim AS deps

WORKDIR /app

# Install dependencies based on lockfile with cache mount
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# 2) Build stage (Next.js build + Pagefind postbuild)
FROM node:22-slim AS builder

WORKDIR /app

ENV NODE_ENV=production

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy config files first (changes less frequently)
COPY package.json package-lock.json* ./
COPY next.config.mjs ./
COPY mdx-components.js ./
COPY tsconfig.json* ./
COPY tailwind.config.* ./
COPY postcss.config.* ./

# Copy source code (changes more frequently)
COPY app/ ./app/
COPY components/ ./components/
COPY public/ ./public/
COPY theme.config.tsx* ./

# Build the Next.js app (this also runs the postbuild script for Pagefind)
RUN npm run build

# 3) Runtime stage (minimal production image)
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4300

# Copy only production node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy package files
COPY package.json package-lock.json* ./

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/mdx-components.js ./mdx-components.js

EXPOSE 4300

# Use the existing npm start script (next start -p 4300)
CMD ["npm", "start"]
