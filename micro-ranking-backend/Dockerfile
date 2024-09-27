FROM node:21-slim

RUN apt update && apt install -y openssl procps

USER node

RUN mkdir /home/node/micro-ranking-backend/

WORKDIR /home/node/micro-ranking-backend/

CMD ["/home/node/micro-ranking-backend/.docker/start.sh"]