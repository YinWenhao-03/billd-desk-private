FROM node:22-bookworm-slim
WORKDIR /app
RUN npm install -g pnpm@8.15.9
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts
COPY src/ ./src/
COPY scripts/ ./scripts/
RUN pnpm build
ENV NODE_APP_RELEASE_PROJECT_ENV=prod
EXPOSE 4300
CMD ["node", "dist/index.js"]
