FROM node:8.9.0

LABEL maintainer="vunguyenhung"

RUN mkdir -p /lobby-service
WORKDIR /lobby-service

COPY . .

EXPOSE 3000

RUN npm install
