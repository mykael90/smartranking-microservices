import { Module } from '@nestjs/common';
import { MongoModule } from './mongo/mongo.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { ScoresModule } from './scores/scores.module';

@Module({
  imports: [RabbitMQModule, MongoModule, ScoresModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
