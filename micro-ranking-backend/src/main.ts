import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

const logger = new Logger('Main');
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbit13:5672/smartranking`,
      ],
      noAck: false,
      queue: 'ranking-backend',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.listen();
  logger.log('Ranking microservice is listening...');
}
bootstrap();
