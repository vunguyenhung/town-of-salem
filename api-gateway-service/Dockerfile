FROM node:8.9.0

LABEL maintainer="vunguyenhung"

RUN mkdir -p /api-gateway-service
WORKDIR /api-gateway-service

COPY . .

EXPOSE 3000

RUN npm install
