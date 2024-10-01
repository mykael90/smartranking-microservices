import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service'; // Injetar o serviço de email
import * as momentTimezone from 'moment-timezone';
import { lastValueFrom } from 'rxjs';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { Types } from 'mongoose';

@Injectable()
export class NotificationsService {
  logger = new Logger(NotificationsService.name);
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

  async finishedGame({
    _id: game,
    challenge: idChallenge,
    category: idCategory,
    players,
    def,
  }: any) {
    this.logger.log(
      `Notifying ${players.length} players about a finished game.`,
      `game: ${game}`,
      `players: ${players}`,
      `def: ${def}`,
      `challenge: ${idChallenge}`,
      `category: ${idCategory}`,
    );

    const winner = await lastValueFrom(
      this.rabbitMQService
        .getClientProxyAdmin()
        .send('find-player-by-id', def.toString()),
    );

    this.logger.log(`Winner: ${JSON.stringify(winner)}`);

    const idLooser = players.find(
      (player: Types.ObjectId) => player.toString() !== def.toString(),
    );

    const looser = await lastValueFrom(
      this.rabbitMQService
        .getClientProxyAdmin()
        .send('find-player-by-id', idLooser.toString()),
    );

    this.logger.log(`Looser: ${JSON.stringify(looser)}`);

    // Envia um email de notificação usando o serviço de e-mail para o vencedor
    await this.emailService.sendEmail(
      winner.email,
      'Finished Game - You Won',
      'finished-game',
      {
        name: winner.name,
        status: 'VICTORY',
      },
    );
    // Envia um email de notificação usando o serviço de e-mail para o vencedor
    await this.emailService.sendEmail(
      looser.email,
      'Finished Game - You Lost',
      'finished-game',
      {
        name: looser.name,
        status: 'DEFEAT',
      },
    );

    // TODO: Implementar o envio de notificação por outros meios
    // Por exemplo: SMS, WhatsApp, etc.
  }
}
