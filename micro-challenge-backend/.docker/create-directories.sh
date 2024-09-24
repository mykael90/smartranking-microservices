#!/bin/bash

echo "Criando diretórios..."

# Diretório base fixo
base_dir="/home/node/micro-challenge-backend/storage"

# Lista de diretórios a serem criados a partir do diretório base
directories=(
    "challenges"
    "challenges/photos"
)

# Loop através da lista de diretórios
for dir in "${directories[@]}"; do
    full_path="$base_dir/$dir"
    if [ ! -d "$full_path" ]; then
        mkdir -p "$full_path"
        echo "Diretório $full_path foi criado."
    else
        echo "Diretório $full_path já existe."
    fi
done