import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { PlayersService } from './players.service';
import { Player } from '../mongo/schemas/player.schema';
import { transformObjectId } from '../utils/string-to-objectid';

const ackErrors: string[] = [];

ackErrors.push('E11000'); // allow ack when duplicate error of key on mongodb
ackErrors.push('not found'); // allow ack when not found (incorrect category or id)

@Controller()
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  logger = new Logger(PlayersController.name);

  @EventPattern('create-player')
  async create(@Payload() payload: Player, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    this.logger.log(`create player: ${JSON.stringify(payload)}`);

    try {
      await this.playersService.create(payload);
      return await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
        throw new RpcException(`error: ${JSON.stringify(error.message)}`); // Throwing exception to notify the client
      }

      await channel.nack(originalMsg);
    }
  }

  @MessagePattern('find-players')
  async findAll(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      const result = await this.playersService.findAll();

      await channel.ack(originalMsg);

      return result;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      await channel.ack(originalMsg); //GET handler, I'll discard even with error, no data lost

      throw new RpcException(`error: ${JSON.stringify(error.message)}`);
    }
  }

  @MessagePattern('find-player-by-id')
  async findOne(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    try {
      const result = await this.playersService.findOne(_id);

      await channel.ack(originalMsg);

      return result;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      await channel.ack(originalMsg); //GET handler, I'll discard even with error, no data lost

      throw new RpcException(`error: ${JSON.stringify(error.message)}`);
    }
  }

  @MessagePattern('update-player')
  update(
    @Payload() payload: { _id: string; updatePlayerDto: Player },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    this.logger.log(`update player: ${JSON.stringify(payload)}`);

    try {
      return this.playersService.update(payload._id, payload.updatePlayerDto);
    } catch (error) {
      this.logger.error(`error: ${error.message}`);

      throw new RpcException(error.message);
    } finally {
      channel.ack(originalMsg);
    }
  }

  @MessagePattern('delete-player')
  remove(@Payload() id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    this.logger.log(`remove player: ${JSON.stringify(id)}`);

    try {
      return this.playersService.remove(id);
    } catch (error) {
      this.logger.error(`error: ${error.message}`);

      throw new RpcException(error.message);
    } finally {
      channel.ack(originalMsg);
    }
  }
}
