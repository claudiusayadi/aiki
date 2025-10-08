FROM node:22-alpine AS base
WORKDIR /usr/src/api
ENV NODE_ENV=production

FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS build
COPY --from=deps /usr/src/api/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:22-alpine AS release
WORKDIR /usr/src/api
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY --from=build /usr/src/api/dist ./dist
EXPOSE ${API_PORT}
CMD ["node", "dist/main.js"]
