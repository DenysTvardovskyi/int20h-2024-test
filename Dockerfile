FROM node:20 AS builder-env

WORKDIR /app

COPY . .

RUN npm install && npm run build

FROM nginx:alpine AS runtime-env

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder-env /app/dist .
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]