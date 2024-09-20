import {
  Body,
  Controller,
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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('api/v1/categories')
export class CategoriesController {
  private logger = new Logger(CategoriesController.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    this.rabbitMQService
      .getClientProxy()
      .emit('create-category', createCategoryDto);

    return {
      statusCode: 201,
      message: 'Category criation requested, soon it will be processed',
    };
  }

  @Get()
  findCategories(@Query() params: string[]) {
    return this.rabbitMQService
      .getClientProxy()
      .send('find-categories', params);
  }

  @Put(':category')
  @UsePipes(ValidationPipe)
  updateCategory(
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param('category') category: string,
  ) {
    return this.rabbitMQService
      .getClientProxy()
      .send('update-category', { updateCategoryDto, category });
  }

  @Post('/:category/players/:_idPlayer')
  assignPlayerToCategory(
    @Param() params: { _idPlayer: string; category: string },
  ) {
    return this.rabbitMQService
      .getClientProxy()
      .send('assign-player-to-category', params);
  }
}
