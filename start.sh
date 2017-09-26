#!/usr/bin/env bash
GREEN='\033[0;32m'
NC='\033[0m'
BUILD=true
DEV=false

while getopts 'dn' flag; do
  case "${flag}" in
    n) BUILD=false ;;
    d) DEV=true ;;
    *) ;;
  esac
done

if [ "$DEV" = true ];then
    if [ "$BUILD" = true ];then
      printf "${GREEN}Docker Compose Build (Dev Mode)${NC}\n" && \
      docker-compose -f docker-compose.dev.yml -p tos build && \
      printf "${GREEN}Docker Compose Up (Dev Mode)${NC}\n" && \
      docker-compose -f docker-compose.dev.yml -p tos up
    else
      printf "${GREEN}Docker Compose Up (Dev Mode)${NC}\n" && \
      docker-compose -f docker-compose.dev.yml -p tos up
    fi
else
  if [ "$BUILD" = true ];then
    printf "${GREEN}Docker Compose Build${NC}\n" && \
    docker-compose -p tos build && \
    printf "${GREEN}Docker Compose Up${NC}\n" && \
    docker-compose -p tos up
  else
    printf "${GREEN}Docker Compose Up${NC}\n" && \
    docker-compose -p tos up
  fi
fi

docker-compose -p tos kill
docker-compose -p tos rm -f
docker volume prune -f