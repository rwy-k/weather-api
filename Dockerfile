# Build stage
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm ci
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/public ./public
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]