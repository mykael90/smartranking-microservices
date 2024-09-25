import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { FileModule } from '../file/file.module';

@Module({
  controllers: [PlayersController],
  imports: [FileModule],
})
export class PlayersModule {}
