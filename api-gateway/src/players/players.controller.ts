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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { ParamValidationPipe } from '../common/pipes/param-validation.pipe';
import { lastValueFrom } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { FileService } from '../file/file.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/players')
export class PlayersController {
  private logger = new Logger(PlayersController.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly fileService: FileService,
  ) {}

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

  @UseGuards(AuthGuard('jwt'))
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

  @UseInterceptors(FileInterceptor('file'))
  @Post(':_id/upload')
  async uploadFile(
    @Param('_id', ParamValidationPipe) _id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image' }),
          // 2MB
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      //verify if player exists
      await lastValueFrom(
        this.rabbitMQService
          .getClientProxyAdmin()
          .send('find-player-by-id', _id),
      );
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new NotFoundException(error.message);
    }

    //upload file
    const directory = join(
      __dirname,
      '..',
      '..',
      'storage',
      'players',
      'photos',
    );
    const fileName = `photo-${_id}.${file.mimetype.split('/')[1]}`;
    const path = join(directory, fileName);
    try {
      await this.fileService.upload(file, path);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new BadRequestException(error.message);
    }

    //update path on the player registered and return player updated
    const updatePlayerDto = {
      photo: fileName,
    };

    try {
      return await lastValueFrom(
        this.rabbitMQService
          .getClientProxyAdmin()
          .send('update-player', { _id, updatePlayerDto }),
      );
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
