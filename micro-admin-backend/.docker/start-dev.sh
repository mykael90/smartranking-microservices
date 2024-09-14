#!/bin/bash

npm i

# Executa o script create-directories.sh para criar os diretórios necessários
echo "Executando o script create-directories.sh..."
/home/node/micro-admin-backend/.docker/create-directories.sh

tail -f /dev/null