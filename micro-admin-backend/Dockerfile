FROM node:21-slim

RUN apt update && apt install -y openssl procps

# RUN npm install -g @nestjs/cli@10.3.2 @prisma/client

USER node

RUN mkdir /home/node/micro-admin-backend/

WORKDIR /home/node/micro-admin-backend/

CMD ["/home/node/micro-admin-backend/.docker/start-dev.sh"]