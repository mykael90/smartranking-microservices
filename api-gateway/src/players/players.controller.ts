import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Logger,
  Put,
} from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { ParamValidationPipe } from '../common/pipes/param-validation.pipe';

@Controller('api/v1/players')
export class PlayersController {
  private logger = new Logger(PlayersController.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    this.rabbitMQService
      .getClientProxyAdmin()
      .emit('create-player', createPlayerDto);

    return {
      statusCode: 201,
      message: 'Player criation requested, soon it will be processed',
    };
  }

  @Get()
  findPlayers() {
    return this.rabbitMQService.getClientProxyAdmin().send('find-players', {});
  }

  @Get(':_id')
  findPlayerById(@Param('_id', ParamValidationPipe) _id: string) {
    return this.rabbitMQService
      .getClientProxyAdmin()
      .send('find-player-by-id', _id);
  }

  @Put(':_id')
  @UsePipes(ValidationPipe)
  updatePlayer(
    @Param('_id', ParamValidationPipe) _id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    return this.rabbitMQService
      .getClientProxyAdmin()
      .send('update-player', { _id, updatePlayerDto });
  }

  @Delete(':_id')
  deletePlayer(@Param('_id', ParamValidationPipe) _id: string) {
    return this.rabbitMQService
      .getClientProxyAdmin()
      .send('delete-player', _id);
  }
}
