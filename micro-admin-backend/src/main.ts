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
      queue: 'admin-backend',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.listen();
  logger.log('Admin microservice is listening...');

  // Se o modo de desenvolvimento estiver ativo, inicie o debugger manualmente
  if (process.env.DEBUG_MODE === 'yes') {
    const inspector = await import('inspector');
    inspector.open(9229, '0.0.0.0'); // Abra o debugger na porta 9229 para todas as interfaces
    logger.log('Debugger listening on port 9229');
  }
}
bootstrap();
