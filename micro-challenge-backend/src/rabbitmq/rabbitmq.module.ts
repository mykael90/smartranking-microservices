import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Global()
@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
  controllers: [],
  imports: [],
})
export class RabbitMQModule {}
