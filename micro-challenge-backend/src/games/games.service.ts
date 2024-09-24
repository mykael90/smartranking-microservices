import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { Model } from 'mongoose';
import { Challenge } from '../mongo/schemas/challenge.schema';
import { RpcException } from '@nestjs/microservices';
import { Game } from '../mongo/schemas/game.schema';
import { ChallengeStatus } from '../mongo/schemas/challenge-status.enum';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel('Challenge') private readonly challengeModel: Model<Challenge>,
    @InjectModel('Game') private readonly gameModel: Model<Game>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}
  async assignGameToChallenge(_id: string, assignGameToChallengeDto: Game) {
    const challenge = await this.challengeModel.findById(_id).exec();

    if (!challenge) {
      throw new RpcException(`Challenge '${_id}' not registered`);
    }

    // Verify if the challenge status is ACCEPTED

    if (challenge.status !== ChallengeStatus.ACCEPTED) {
      throw new RpcException(`The challenge status isn't ACCEPTED!`);
    }

    /**
     * Verify if the winner is in the challenge
     */
    const playerFiltered = challenge.players.filter(
      (player) => player == assignGameToChallengeDto.def,
    );

    if (playerFiltered.length == 0) {
      throw new RpcException(`The player winner was not in challenge`);
    }

    /**
     * First lets create and persist the game object
     */
    const game = new this.gameModel(assignGameToChallengeDto);

    /**
     * Assign the object game to category recovered in challenge
     */
    game.category = challenge.category;

    /**
     * Assign the object game to players that was in the challenge
     */
    game.players = challenge.players;

    const result = await game.save();

    /**
     * When one game was registered by a user, we change the
     * challenge status to REALIZED
     */
    challenge.status = ChallengeStatus.REALIZED;

    /**
     * Recover the game and assign to challenge
     */
    challenge.game = result;

    try {
      return await this.challengeModel
        .findOneAndUpdate({ _id }, { $set: challenge }, { new: true })
        .populate('game')
        .exec();
    } catch (error) {
      /**
       * If the challenge update fails, we exclude the game saved before
       */
      await this.gameModel.deleteOne({ _id: result._id }).exec();
      throw new RpcException(error.message);
    }
  }
}
