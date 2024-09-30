FROM node:21-slim

RUN apt update && apt install -y openssl procps

USER node

RUN mkdir /home/node/micro-notifications/

WORKDIR /home/node/micro-notifications/

CMD ["/home/node/micro-notifications/.docker/start.sh"]