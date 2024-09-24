import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Challenge } from '../mongo/schemas/challenge.schema';
import { Game } from '../mongo/schemas/game.schema';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { lastValueFrom } from 'rxjs';
import { ChallengeStatus } from '../mongo/schemas/challenge-status.enum';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<Challenge>,
    @InjectModel('Game') private readonly gameModel: Model<Game>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  private readonly logger = new Logger(ChallengesService.name);

  async create(challenge: Challenge): Promise<Challenge> {
    try {
      // Verify if requester is a player in the challenge

      const requester = challenge.players.find(
        (player) => player === challenge.requester,
      );

      if (!requester) {
        throw new RpcException(
          `The id ${challenge.requester} isn't a Player in the match!`,
        );
      }

      // Verify if players are registered
      const player1 = await this.findPlayerById(challenge.players[0]);
      const player2 = await this.findPlayerById(challenge.players[1]);

      if (!player1 || !player2) {
        throw new RpcException(`One or more players aren't registered!`);
      }

      // Verify if players are in the same category

      if (player1.category._id.toString() !== player2.category._id.toString()) {
        throw new RpcException(`The players aren't in the same category!`);
      }

      const challengeCreated = new this.challengeModel(challenge);
      challenge.category = player1.category.name;
      challenge.requestDate = new Date();

      //  When created the challenge status i'll be PENDING

      challenge.status = ChallengeStatus.PENDING;

      return await challengeCreated.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  findAll() {
    return `This action returns all challenges`;
  }

  findOne(id: number) {
    return `This action returns a #${id} challenge`;
  }

  update(id: number, updateChallengeDto: Challenge) {
    return `This action updates a #${id} challenge`;
  }

  remove(id: number) {
    return `This action removes a #${id} challenge`;
  }

  async findPlayers() {
    return await lastValueFrom(
      this.rabbitMQService.getClientProxyAdmin().send('find-players', {}),
    );
  }

  async findCategories(category: string) {
    return await lastValueFrom(
      this.rabbitMQService
        .getClientProxyAdmin()
        .send('find-categories', category),
    );
  }

  async findPlayerById(_id: string) {
    return await lastValueFrom(
      this.rabbitMQService.getClientProxyAdmin().send('find-player-by-id', _id),
    );
  }
}
