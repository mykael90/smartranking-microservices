import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { MongoModule } from './mongo/mongo.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [MongoModule, CategoriesModule, PlayersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
