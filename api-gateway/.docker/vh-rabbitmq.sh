#!/bin/sh
echo "Entrou no vh-rabbitmq.sh"
wait_for_rabbitmq() {
  until curl -u user:password -s -o /dev/null -w "%{http_code}" http://rabbit13:15672/api/vhosts | grep -q "200"; do
    echo "Aguardando RabbitMQ iniciar..."
    sleep 2
  done
}

# Aguardar RabbitMQ iniciar
wait_for_rabbitmq


# Criar um virtual host
curl -u user:password -H "Content-Type: application/json" -XPUT \
  http://rabbit13:15672/api/vhosts/smartranking

# Criar permissões para o virtual host
curl -u user:password -H "Content-Type: application/json" -XPUT \
  http://rabbit13:15672/api/permissions/smartranking/user \
  -d'{
    "configure": ".*",
    "write": ".*",
    "read": ".*"
  }'