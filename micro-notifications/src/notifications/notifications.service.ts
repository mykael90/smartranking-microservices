import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service'; // Injetar o serviço de email
import * as momentTimezone from 'moment-timezone';
import { lastValueFrom } from 'rxjs';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { Types } from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async newChallenge({ requester: requesterId, challengeDate, players }: any) {
    // TODO: Pegar o e-mail do usuário que desafiou e outras informações com o cliente RabbitMQ

    const date = new Date(challengeDate);

    const [challengeDateFormat, challengeTimeFormat] = momentTimezone(date)
      .format('DD/MM/YYYY HH:mm')
      .split(' ');

    const requester = await lastValueFrom(
      this.rabbitMQService
        .getClientProxyAdmin()
        .send('find-player-by-id', requesterId.toString()),
    );

    const challengedId = players.find(
      (player: Types.ObjectId) => player.toString() !== requesterId.toString(),
    );

    const challenged = await lastValueFrom(
      this.rabbitMQService
        .getClientProxyAdmin()
        .send('find-player-by-id', challengedId.toString()),
    );

    // Envia um email de notificação usando o serviço de e-mail
    await this.emailService.sendEmail(
      challenged.email,
      'New Challenge',
      'new-challenge',
      {
        challenged: challenged.name,
        requester: requester.name,
        challengeDate: challengeDateFormat,
        challengeHour: challengeTimeFormat,
      },
    );

    // TODO: Implementar o envio de notificação por outros meios
    // Por exemplo: SMS, WhatsApp, etc.
  }
  async updatedChallenge({
    requester: requesterId,
    challengeDate,
    players,
    status,
  }: any) {
    // TODO: Pegar o e-mail do usuário que desafiou e outras informações com o cliente RabbitMQ

    const date = new Date(challengeDate);

    const [challengeDateFormat, challengeTimeFormat] = momentTimezone(date)
      .format('DD/MM/YYYY HH:mm')
      .split(' ');

    const requester = await lastValueFrom(
      this.rabbitMQService
        .getClientProxyAdmin()
        .send('find-player-by-id', requesterId.toString()),
    );

    const challengedId = players.find(
      (player: Types.ObjectId) => player.toString() !== requesterId.toString(),
    );

    const challenged = await lastValueFrom(
      this.rabbitMQService
        .getClientProxyAdmin()
        .send('find-player-by-id', challengedId.toString()),
    );

    // Envia um email de notificação usando o serviço de e-mail
    await this.emailService.sendEmail(
      requester.email,
      `${status} Challenge`,
      'updated-challenge',
      {
        challenged: challenged.name,
        requester: requester.name,
        challengeDate: challengeDateFormat,
        challengeHour: challengeTimeFormat,
        status,
      },
    );

    // TODO: Implementar o envio de notificação por outros meios
    // Por exemplo: SMS, WhatsApp, etc.
  }

  async finishedGame(params: any) {
    const { to, challenged, requester, result } = params;
    // Envia um email de notificação usando o serviço de e-mail
    await this.emailService.sendEmail(to, 'Finished Game', 'finished-game', {
      challenged,
      requester,
      result,
    });

    // TODO: Implementar o envio de notificação por outros meios
    // Por exemplo: SMS, WhatsApp, etc.
  }
}
