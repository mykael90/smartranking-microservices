import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  private clientAdminBackend: ClientProxy;
  private clientChallengeBackend: ClientProxy;
  private clientRankingBackend: ClientProxy;
  private clientNotification: ClientProxy;

  constructor() {
    this.clientAdminBackend = this.createClientProxy('admin-backend');
    this.clientChallengeBackend = this.createClientProxy('challenge-backend');
    this.clientRankingBackend = this.createClientProxy('ranking-backend');
    this.clientNotification = this.createClientProxy('notification');
  }

  // Método auxiliar para criar um cliente RabbitMQ
  private createClientProxy(queue: string): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbit13:5672/smartranking`,
        ],
        queue,
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  // Método para obter o cliente da fila 'admin-backend'
  getClientProxyAdmin(): ClientProxy {
    return this.clientAdminBackend;
  }

  // Método para obter o cliente da fila 'user-backend'
  getClientProxyChallenge(): ClientProxy {
    return this.clientChallengeBackend;
  }

  // Método para obter o cliente da fila 'ranking-backend'
  getClientProxyRanking(): ClientProxy {
    return this.clientRankingBackend;
  }

  // Método para obter o cliente da fila 'notification'
  getClientProxyNotification(): ClientProxy {
    return this.clientNotification;
  }
}
