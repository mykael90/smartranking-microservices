#!/bin/bash
echo "Entrou no start-dev.sh"

npm i

wait

npm run start:dev

# Executa indefinitamente
# tail -f /dev/null
