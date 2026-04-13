# syntax=docker/dockerfile:1.7

FROM node:22-alpine
WORKDIR /app

COPY package.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev --no-audit --no-fund

COPY server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
