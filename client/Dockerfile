# Stage 1: Install dependencies
FROM node:16.17.0-alpine as installer

WORKDIR /usr/src/app

COPY package.json yarn.lock /usr/src/app/

RUN yarn install
RUN yarn global add serve


# Stage 2: Compile and build typescript
FROM node:16.17.0-alpine as builder

WORKDIR /usr/src/app

COPY ./public ./public
COPY ./src ./src
COPY ./tsconfig.json .
COPY ./package.json .
COPY --from=installer /usr/src/app/node_modules ./node_modules

RUN ls

RUN yarn build

# Stage 3: Run the application
FROM node:16.17.0-alpine as runner

WORKDIR /usr/src/app

ARG APP_MODE=development
ENV NODE_ENV=$APP_NODE

EXPOSE 3000

COPY --from=builder /usr/src/app/build ./build

CMD [ "npx", "serve", "-s", "build" ]
