import { Module } from '@nestjs/common';
import { MongoModule } from './mongo/mongo.module';
import { ChallengesModule } from './challenges/challenges.module';
import { GamesModule } from './games/games.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule, MongoModule, ChallengesModule, GamesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
