FROM node:21-slim

RUN apt update && apt install -y openssl procps curl

USER node

RUN mkdir /home/node/api-gateway/

WORKDIR /home/node/api-gateway/

CMD ["/home/node/api-gateway/.docker/start.sh"]