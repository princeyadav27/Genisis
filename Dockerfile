FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build npm run build
EXPOSE 3000
CMD ["sh", "-c", "npx drizzle-kit push && npm run start -- --hostname 0.0.0.0"]
