FROM node:21-slim

RUN apt update && apt install -y openssl procps

USER node

RUN mkdir /home/node/micro-challenge-backend/

WORKDIR /home/node/micro-challenge-backend/

CMD ["/home/node/micro-challenge-backend/.docker/start.sh"]