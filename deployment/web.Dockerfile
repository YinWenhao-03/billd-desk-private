FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN npm install -g pnpm@8.15.9
COPY client/package.json client/pnpm-lock.yaml client/.npmrc ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts
COPY client/ ./
RUN pnpm build:web
FROM nginx:1.28-alpine
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
