import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';

@Module({
  controllers: [ScoresController],
})
export class ScoresModule {}
