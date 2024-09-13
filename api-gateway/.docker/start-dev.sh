#!/bin/bash
echo "Entrou no start-dev.sh"

npm i

# Executa o script vh-rabbitmq.sh para criar o virtual host
# sh ./vh-rabbitmq.sh
/home/node/api-gateway/.docker/vh-rabbitmq.sh

# Espera o script vh-rabbitmq.sh terminar
wait

# Executa indefinitamente
tail -f /dev/null
