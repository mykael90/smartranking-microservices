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

    this.logger.log(`create challenge: ${JSON.stringify(createChallengeDto)}`);

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

  @MessagePattern('findAllChallenges')
  findAll() {
    return this.challengesService.findAll();
  }

  @MessagePattern('findOneChallenge')
  findOne(@Payload() id: number) {
    return this.challengesService.findOne(id);
  }

  @MessagePattern('updateChallenge')
  update(@Payload() updateChallengeDto: Challenge) {
    return this.challengesService.update(
      updateChallengeDto.id,
      updateChallengeDto,
    );
  }

  @MessagePattern('removeChallenge')
  remove(@Payload() id: number) {
    return this.challengesService.remove(id);
  }
}
