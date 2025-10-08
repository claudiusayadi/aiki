FROM node:20-alpine AS base

WORKDIR /usr/src/api

# Install dependencies into tmp directory
# This will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /tmp/dev
COPY package.json yarn.lock /tmp/dev/
RUN cd /tmp/dev && yarn install --frozen-lockfile

# Install with --production (exclude devDependencies)
RUN mkdir -p /tmp/prod
COPY package.json yarn.lock /tmp/prod/
RUN cd /tmp/prod && yarn install --frozen-lockfile --production

# Copy node_modules from tmp directory
# Then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /tmp/dev/node_modules node_modules
COPY . ./

# Build the application
ENV NODE_ENV=production
RUN yarn run build

# Copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /tmp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/api/dist ./
COPY --from=prerelease /usr/src/api/package.json ./

# Expose port
EXPOSE ${API_PORT}

CMD [ "node", "dist/src/main.js" ]
