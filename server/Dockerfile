# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.16.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app/server

ENV NODE_ENV="production"

# --- Build stage ---
FROM base AS build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Copy only server package files to optimize caching
COPY server/package*.json ./
RUN npm ci

# Copy full app source
COPY server/ ./

# --- Final stage ---
FROM base
COPY --from=build /app/server /app/server

EXPOSE 3000

CMD ["npm", "start"]
