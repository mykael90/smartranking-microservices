#!/bin/bash

echo "Entrou no start.sh"

# Verifica se a variável ENV está definida
if [ -z "$ENV" ]; then
  echo "A variável ENV não está definida."
  exit 1
fi

# Executa o script vh-rabbitmq.sh para criar o virtual host
# sh ./vh-rabbitmq.sh
/home/node/api-gateway/.docker/vh-rabbitmq.sh

# Espera o script vh-rabbitmq.sh terminar
wait

# Condicionais baseadas no valor de ENV
if [ "$ENV" == "dev" ]; then
  echo "Ambiente de desenvolvimento detectado. Rodando script de desenvolvimento..."
  /home/node/api-gateway/.docker/start-dev.sh  # Substitua pelo script para o ambiente de dev
elif [ "$ENV" == "prod" ]; then
  echo "Ambiente de produção detectado. Rodando script de produção..."
  /home/node/api-gateway/.docker/start-prod.sh  # Substitua pelo script para o ambiente de prod
else
  echo "Valor de ENV desconhecido: $ENV"
  exit 1
fi
