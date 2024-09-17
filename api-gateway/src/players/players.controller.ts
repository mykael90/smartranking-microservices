import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
      .getClientProxy()
      .emit('create-player', createPlayerDto);
  }

  @Get()
  findPlayers() {
    return this.rabbitMQService.getClientProxy().send('find-players', {});
  }

  @Get(':_id')
  findPlayerById(@Param('_id', ParamValidationPipe) _id: string) {
    return this.rabbitMQService.getClientProxy().send('find-player-by-id', _id);
  }

  @Put(':_id')
  @UsePipes(ValidationPipe)
  updatePlayer(
    @Param('_id', ParamValidationPipe) _id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    return this.rabbitMQService
      .getClientProxy()
      .send('update-player', { _id, updatePlayerDto });
  }

  @Delete(':_id')
  deletePlayer(@Param('_id', ParamValidationPipe) _id: string) {
    return this.rabbitMQService.getClientProxy().send('delete-player', _id);
  }
}
