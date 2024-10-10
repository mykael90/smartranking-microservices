import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { FileModule } from '../file/file.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PlayersController],
  imports: [AuthModule, FileModule],
})
export class PlayersModule {}
