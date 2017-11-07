FROM node:8.9.0

LABEL maintainer="vunguyenhung"

RUN mkdir -p /authentication-service
WORKDIR /authentication-service

COPY . .

EXPOSE 3000

RUN npm install
