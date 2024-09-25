import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { GamesService } from './games.service';
import { transformObjectId } from '../utils/string-to-objectid';

@Controller()
export class GamesController {
  private readonly logger = new Logger(GamesController.name);

  constructor(private readonly gamesService: GamesService) {}

  @MessagePattern('assign-game-to-challenge')
  create(@Payload() payload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    payload = transformObjectId(payload);

    this.logger.log(`create game: ${JSON.stringify(payload)}`);
    try {
      const result = this.gamesService.assignGameToChallenge(
        payload._id,
        payload.assignGameToChallengeDto,
      );
      return result;
    } catch (error) {
      this.logger.error(`error: ${error.message}`);
      throw new RpcException(error.message);
    } finally {
      channel.ack(originalMsg);
    }
  }
}
