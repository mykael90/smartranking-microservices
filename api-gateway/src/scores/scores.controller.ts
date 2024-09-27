import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Controller('api/v1/ranking')
export class ScoresController {
  private readonly logger = new Logger(ScoresController.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  @Get()
  findAll(@Query() params: string[]) {
    return this.rabbitMQService
      .getClientProxyRanking()
      .send('list-ranking', params);
  }
}
