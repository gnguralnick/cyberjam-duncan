FROM node:20-alpine as base
# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
# Copy pnpm-specific files
COPY pnpm-lock.yaml ./
COPY package.json ./

FROM base as development
# Enable pnpm store
RUN pnpm config set store-dir /root/.local/share/pnpm/store
# Install all dependencies (including devDependencies)
RUN pnpm install
COPY . .
CMD ["pnpm", "dev"]

FROM base as production
# Install dependencies without devDependencies
RUN pnpm install --prod
COPY . .
RUN pnpm build
CMD ["pnpm", "preview"]