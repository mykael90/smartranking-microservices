import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { transformObjectId } from '../utils/string-to-objectid';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  logger = new Logger(NotificationsController.name);

  @EventPattern('new-challenge')
  async newChallengeNotification(
    @Payload() params: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    this.logger.log(`new notification challenge: ${JSON.stringify(params)}`);

    params = transformObjectId(params);

    try {
      await this.notificationsService.newChallenge(params);

      return await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${error.message}`);
      await channel.nack(originalMsg);
      throw new RpcException(error.message);
    }
  }

  @EventPattern('updated-challenge')
  async updatedChallengeNotification(
    @Payload() params: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    this.logger.log(
      `accepted notification challenge: ${JSON.stringify(params)}`,
    );

    params = transformObjectId(params);

    try {
      await this.notificationsService.updatedChallenge(params);

      return await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${error.message}`);
      await channel.nack(originalMsg);
      throw new RpcException(error.message);
    }
  }

  @EventPattern('finished-game')
  async finishedGameNotification(
    @Payload() params: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    this.logger.log(`finished game: ${JSON.stringify(params)}`);

    params = transformObjectId(params);

    try {
      await this.notificationsService.finishedGame(params);

      return await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${error.message}`);
      await channel.ack(originalMsg); //AJEITAR AQUI
      throw new RpcException(error.message);
    }
  }
}
