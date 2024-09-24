import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { AssignGameToChallengeDto } from './dto/assign-game-to-challenge.dto';

@Controller('api/v1/challenges/games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}
  @Post(':challenge')
  assignPlayerToCategory(
    @Param('challenge') _id: string,
    @Body() assignGameToChallengeDto: AssignGameToChallengeDto,
  ) {
    return this.rabbitMQService
      .getClientProxyChallenge()
      .send('assign-game-to-challenge', { _id, assignGameToChallengeDto });
  }
}
