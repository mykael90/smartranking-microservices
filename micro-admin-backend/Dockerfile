FROM node:21-slim

RUN apt update && apt install -y openssl procps

USER node

RUN mkdir /home/node/micro-admin-backend/

WORKDIR /home/node/micro-admin-backend/

CMD ["/home/node/micro-admin-backend/.docker/start-dev.sh"]