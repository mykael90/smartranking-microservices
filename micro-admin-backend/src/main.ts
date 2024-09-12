import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

const logger = new Logger('Main');
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://user:password@localhost:5672/smartranking'],
      queue: 'admin-backend',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.listen();
  logger.log('Admin microservice is listening...');
}
bootstrap();
