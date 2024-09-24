import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeStatusValidationPipe } from './pipes/challenge-status-validation.pipe';
import { AssignGameToChallengeDto } from '../games/dto/assign-game-to-challenge.dto';

@Controller('api/v1/challenges')
export class ChallengesController {
  private logger = new Logger(ChallengesController.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createChallengeDto: CreateChallengeDto) {
    return this.rabbitMQService
      .getClientProxyChallenge()
      .send('create-challenge', createChallengeDto);
  }

  @Get()
  findAll(@Query('idPlayer') idPlayer: string) {
    return this.rabbitMQService
      .getClientProxyChallenge()
      .send('find-challenges', idPlayer);
  }

  @Put(':challenge')
  update(
    @Param('challenge') _id: string,
    @Body(ChallengeStatusValidationPipe) updateChallengeDto: UpdateChallengeDto,
  ) {
    return this.rabbitMQService
      .getClientProxyChallenge()
      .send('update-challenge', {
        _id,
        updateChallengeDto,
      });
  }

  @Post(':challenge/game')
  assignGameToChallenge(
    @Param('challenge') _id: string,
    @Body() assignGameToChallengeDto: AssignGameToChallengeDto,
  ) {
    return this.rabbitMQService
      .getClientProxyChallenge()
      .send('assign-game-to-challenge', { _id, assignGameToChallengeDto });
  }

  @Delete(':challenge')
  remove(@Param('challenge') _id: string) {
    return this.rabbitMQService
      .getClientProxyChallenge()
      .send('remove-challenge', _id);
  }
}
