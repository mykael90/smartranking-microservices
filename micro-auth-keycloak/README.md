# keycloak-mysql

Foi opção própria deixar o keycloak em um docker-compose com rede separada para trazer maior complexidade nesse treinamento.
Dessa forma a aplicação do nest tem que chamar o gateway do docker para depois se conectar a rede do keycloak.
