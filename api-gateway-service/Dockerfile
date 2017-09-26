FROM node:8.5.0

LABEL maintainer="vunguyenhung"

RUN mkdir -p /tos-api-gateway-service
WORKDIR /tos-api-gateway-service

COPY . .

EXPOSE 3000

RUN npm install