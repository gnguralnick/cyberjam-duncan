FROM node:20-alpine as base
# Install pnpm
WORKDIR /app
# Copy npm-specific files
COPY package-lock.json ./
COPY package.json ./

FROM base as development
# Install all dependencies (including devDependencies)
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

FROM base as production
# Install dependencies without devDependencies
RUN npm install -g typescript
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]