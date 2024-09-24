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

      // Verify if players are already scheduled in the same time

      const challengeCreated = new this.challengeModel(challenge);
      challengeCreated.category = player1.category.name;
      challengeCreated.requestDate = new Date();

      //  When created the challenge status i'll be PENDING

      challengeCreated.status = ChallengeStatus.PENDING;

      return await challengeCreated.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async findAll(): Promise<Challenge[]> {
    try {
      return await this.challengeModel.find().exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async findPlayerChallenges(_id: string): Promise<Challenge[]> {
    try {
      return await this.challengeModel.find({ players: _id }).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async update(_id: string, updateChallengeDto: Challenge): Promise<Challenge> {
    try {
      // Verify if challenge exists
      const challenge = await this.challengeModel.findById(_id);

      if (!challenge) {
        throw new NotFoundException(`Challenge '${_id}' not found`);
      }

      // Verify if status is PENDING

      if (challenge.status !== ChallengeStatus.PENDING) {
        throw new BadRequestException(`The challenge status isn't PENDING!`);
      }

      // Update the challenge

      const challengeUpdated = this.challengeModel.findByIdAndUpdate(
        _id,
        { ...updateChallengeDto, responseDate: new Date() },
        { new: true },
      );

      return challengeUpdated;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async remove(_id: string) {
    const challenge = await this.challengeModel.findById(_id).exec();

    try {
      if (!challenge) {
        throw new BadRequestException(`Challenge '${_id}' not registered`);
      }

      // Verify if status is PENDING

      if (challenge.status !== ChallengeStatus.PENDING) {
        throw new BadRequestException(`The challenge status isn't PENDING!`);
      }

      /**
       * To do the logic deletion of challenge, we update the
       * challenge status do CANCELLED
       */
      challenge.status = ChallengeStatus.CANCELLED;

      await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: challenge })
        .exec();

      return {
        message: `Challenge '${_id}' deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
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
