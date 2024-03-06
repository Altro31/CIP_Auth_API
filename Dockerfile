FROM node:lts-alpine3.19
LABEL authors="altro"

WORKDIR /app/usr

COPY package.json ./

RUN yarn install --production

COPY . .

EXPOSE 4000

ENV DB_USER="postgres"
ENV DB_PASSWORD="postgres"
ENV DB_HOST="auth_bd"
ENV DB_PORT=5432
ENV DB_DB="postgres"
ENV DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DB}?schema=public"

ENV SALT_ROUNDS=10
ENV JWT_SECRET="SomeLargeStringToBeUsedAsSecretByCIP_Auth_API"

RUN yarn prisma generate

ENTRYPOINT ["yarn", "run", "start:dev"]