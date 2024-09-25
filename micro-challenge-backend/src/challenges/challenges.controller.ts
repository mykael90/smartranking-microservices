import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { ChallengesService } from './challenges.service';
import { Challenge } from '../mongo/schemas/challenge.schema';
import { transformObjectId } from '../utils/string-to-objectid';

const ackErrors: string[] = [];

ackErrors.push('E11000'); // allow ack when duplicate error of key on mongodb
ackErrors.push('not found'); // allow ack when not found (incorrect category or id)
@Controller()
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  logger = new Logger(ChallengesController.name);

  @MessagePattern('create-challenge')
  async create(
    @Payload() createChallengeDto: Challenge,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    createChallengeDto = transformObjectId(createChallengeDto);

    try {
      const result = await this.challengesService.create(createChallengeDto);
      return result;
    } catch (error) {
      this.logger.error(`error: ${error.message}`);
      throw new RpcException(error.message);
    } finally {
      await channel.ack(originalMsg); //GET handler, I'll discard even with error, no data lost
    }
  }

  @MessagePattern('find-challenges')
  async findAll(@Payload() params: string[], @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    const idPlayer = params['idPlayer'];

    try {
      if (idPlayer) {
        const result =
          await this.challengesService.findPlayerChallenges(idPlayer);
        return result;
      }

      const result = await this.challengesService.findAll();
      return result;
    } catch (error) {
      this.logger.error(`error: ${error.message}`);
      throw new RpcException(error.message);
    } finally {
      await channel.ack(originalMsg);
    }
  }

  @MessagePattern('update-challenge')
  update(@Payload() payload, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`update challenge: ${JSON.stringify(payload)}`);

    try {
      const result = this.challengesService.update(
        payload._id,
        payload.updateChallengeDto,
      );
      return result;
    } catch (error) {
      this.logger.error(`error: ${error.message}`);
      throw new RpcException(error.message);
    } finally {
      channel.ack(originalMsg);
    }
  }

  @MessagePattern('remove-challenge')
  remove(@Payload() _id: string, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`remove challenge: ${JSON.stringify(_id)}`);
    try {
      return this.challengesService.remove(_id);
    } catch (error) {
      this.logger.error(`error: ${error.message}`);
      throw new RpcException(error.message);
    } finally {
      channel.ack(originalMsg);
    }
  }
}
