#!/bin/bash

echo "Entrou no start.sh"

# Verifica se a variável ENV está definida
if [ -z "$ENV" ]; then
  echo "A variável ENV não está definida."
  exit 1
fi

# Executa o script create-directories.sh para criar os diretórios necessários
echo "Executando o script create-directories.sh..."
/home/node/micro-admin-backend/.docker/create-directories.sh

# Condicionais baseadas no valor de ENV
if [ "$ENV" == "dev" ]; then
  echo "Ambiente de desenvolvimento detectado. Rodando script de desenvolvimento..."
  /home/node/micro-admin-backend/.docker/start-dev.sh  # Substitua pelo script para o ambiente de dev
elif [ "$ENV" == "prod" ]; then
  echo "Ambiente de produção detectado. Rodando script de produção..."
  /home/node/micro-admin-backend/.docker/start-prod.sh  # Substitua pelo script para o ambiente de prod
else
  echo "Valor de ENV desconhecido: $ENV"
  exit 1
fi
