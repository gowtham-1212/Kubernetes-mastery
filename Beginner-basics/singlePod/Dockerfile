# ==============================================================================
# STAGE 1: THE BUILDER
# ==============================================================================
# We start with a standard, lightweight Node.js OS (node:20-slim).
# We name this stage "builder" using the 'AS' keyword so we can reference it later.
# This stage contains all the tools needed to build the app (like npm).
FROM node:20-slim AS builder

WORKDIR /app

# Copy the package files and install ONLY production dependencies.
# We don't need development tools (like nodemon or jest) in production.
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of your application code (server.js, etc.) into the builder.
COPY . .

EXPOSE 3000

CMD ["server.js"]