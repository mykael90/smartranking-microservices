import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { Model, Types } from 'mongoose';
import { Score } from '../mongo/schemas/score.schema';
import { RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { transformObjectId } from '../utils/string-to-objectid';
import * as _ from 'lodash';
import { EnumEvent } from '../mongo/schemas/challenge-status.enum copy';

@Injectable()
export class ScoresService {
  logger = new Logger(ScoresService.name);
  constructor(
    @InjectModel('Score') private readonly scoreModel: Model<Score>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create({
    _id: game,
    challenge: idChallenge,
    category: idCategory,
    players,
    def,
  }: any) {
    // start transaction to save only if all operations are successfull, player victory and defeat are stored in the database

    // verify if the game is already in the scores
    const score = await this.scoreModel.find({
      game,
    });

    if (score.length > 1) {
      throw new RpcException('The game is already in the scores');
    }

    // get proerties of category

    const category = await lastValueFrom(
      this.rabbitMQService
        .getClientProxyAdmin()
        .send('find-categories', { idCategory }),
    );

    // get the victory player and save it

    const eventWinner = category.events.find(
      (event: any) => event.name === EnumEvent.VICTORY,
    );

    const scoreWinner = {
      game,
      challenge: idChallenge,
      category: idCategory,
      player: def,
      eventName: eventWinner.name,
      enventOperation: eventWinner.operation,
      score: eventWinner.value,
    };

    const createdScoreWinner = new this.scoreModel(scoreWinner);

    // get the defeat player

    const eventLooser = category.events.find(
      (event: any) => event.name === EnumEvent.DEFEAT,
    );

    const looserPlayer = players.find(
      (player: Types.ObjectId) => player.toString() !== def.toString(),
    );

    const scoreLoser = {
      game,
      challenge: idChallenge,
      category: idCategory,
      player: looserPlayer,
      eventName: eventLooser.name,
      enventOperation: eventLooser.operation,
      score: eventLooser.value,
    };

    const createdScoreLoser = new this.scoreModel(scoreLoser);

    try {
      await createdScoreWinner.save();
      await createdScoreLoser.save();

      return { createdScoreWinner, createdScoreLoser };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async listRanking(idCategory: Types.ObjectId, dateRef: Date) {
    try {
      this.logger.debug('idCategory: ', idCategory);
      let challenges = await lastValueFrom(
        this.rabbitMQService
          .getClientProxyChallenge()
          .send('find-challenges', { idCategory }),
      );

      challenges = transformObjectId(challenges);

      this.logger.debug(
        'challengesFiltered: ',
        challenges.map((challenge: any) => challenge._id),
      );

      const challengesBeforeDateRef = challenges.filter((challenge: any) => {
        this.logger.debug(new Date(challenge.challengeDate), dateRef);
        return new Date(challenge.challengeDate) <= dateRef;
      });

      // const challengesBeforeDateRef = [...challenges];

      const result = await this.scoreModel
        .find()
        .where('challenge')
        .in(challengesBeforeDateRef.map((challenge: any) => challenge._id))
        .exec();

      const resultGrouped = _.chain(result)
        .groupBy('player')
        .map((value, key) => ({
          player: key,
          history: _.countBy(value, 'eventName'),
          total: _.sumBy(value, 'score'),
        }))
        .value();

      this.logger.debug('resultGrouped: ', resultGrouped);
      return resultGrouped;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
