import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  private clientAdminBackend: ClientProxy;

  constructor() {
    this.clientAdminBackend = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbit13:5672/smartranking`,
        ],
        queue: 'admin-backend',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  getClientProxy(): ClientProxy {
    return this.clientAdminBackend;
  }
}
