FROM node:20-alpine as base
# Install pnpm
WORKDIR /app
# Copy npm-specific files
COPY package-lock.json ./
COPY package.json ./

FROM base as development
# Install all dependencies (including devDependencies)
RUN npm install --force
COPY . .
CMD ["npm", "run", "dev"]

FROM base as production
# Install dependencies without devDependencies
RUN npm install --prod --force
COPY . .
RUN npm build
CMD ["npm", "run", "preview"]