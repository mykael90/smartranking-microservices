#!/bin/sh
echo "Entrou no vh-rabbitmq.sh"
wait_for_rabbitmq() {
  until curl -u $RABBITMQ_DEFAULT_USER:$RABBITMQ_DEFAULT_PASS -s -o /dev/null -w "%{http_code}" http://rabbit13:15672/api/vhosts | grep -q "200"; do
    echo "Aguardando RabbitMQ iniciar..."
    sleep 2
  done
}

# Aguardar RabbitMQ iniciar
wait_for_rabbitmq


# Criar um virtual host
curl -u $RABBITMQ_DEFAULT_USER:$RABBITMQ_DEFAULT_PASS -H "Content-Type: application/json" -XPUT \
  http://rabbit13:15672/api/vhosts/smartranking

# Criar permissões para o virtual host
curl -u $RABBITMQ_DEFAULT_USER:$RABBITMQ_DEFAULT_PASS -H "Content-Type: application/json" -XPUT \
  http://rabbit13:15672/api/permissions/smartranking/$RABBITMQ_DEFAULT_USER \
  -d'{
    "configure": ".*",
    "write": ".*",
    "read": ".*"
  }'