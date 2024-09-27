import { Controller, Logger } from '@nestjs/common';
import { ScoresService } from './scores.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { Score } from '../mongo/schemas/score.schema';
import { transformObjectId } from '../utils/string-to-objectid';

const ackErrors: string[] = [];

ackErrors.push('E11000'); // allow ack when duplicate error of key on mongodb
ackErrors.push('not found'); // allow ack when not found (incorrect score or id)

@Controller()
export class ScoresController {
  logger: Logger = new Logger(ScoresController.name);

  constructor(private readonly scoresService: ScoresService) {}

  @EventPattern('create-score')
  async createScore(@Payload() score: Score, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    this.logger.log(`create score: ${JSON.stringify(score)}`);

    score = transformObjectId(score);

    try {
      await this.scoresService.create(score);

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

  @MessagePattern('list-ranking')
  async listScore(@Payload() params: string[], @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    const idCategory = transformObjectId(params['idCategory']);

    let dateRef: Date;

    if (params['dateRef']) {
      dateRef = new Date(params['dateRef']);
      dateRef.setDate(dateRef.getDate() + 1); // ao final do dia
    } else {
      dateRef = new Date();
      dateRef.setDate(dateRef.getDate() + 1); // ao final do dia
    }

    this.logger.log(`list ranking: ${JSON.stringify(params)}`);

    try {
      const result = await this.scoresService.listRanking(idCategory, dateRef);

      await channel.ack(originalMsg);
      return result;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      await channel.ack(originalMsg);
    }
  }
}
