import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Player } from '../mongo/schemas/player.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel('Player')
    private readonly playerModel: Model<Player>,
  ) {}

  private readonly logger = new Logger(PlayersService.name);
  async create(createPlayerDto: Player): Promise<Player> {
    try {
      const playerCreated = new this.playerModel(createPlayerDto);
      return await playerCreated.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async findAll(): Promise<Player[]> {
    try {
      return await this.playerModel.find().exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async findOne(_id: string): Promise<Player> {
    try {
      const player = await this.playerModel.findById(_id).exec();

      if (!player) {
        throw new NotFoundException(`Player '${_id}' not found`);
      }

      return player;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async update(_id: string, updatePlayerDto: Player): Promise<Player> {
    try {
      const result = await this.playerModel
        .findByIdAndUpdate(_id, updatePlayerDto, {
          new: true,
        })
        .exec();

      if (!result) {
        throw new NotFoundException(`Player '${_id}' not found`);
      }

      return result;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async remove(_id: string): Promise<Player> {
    try {
      const result = await this.playerModel
        .findByIdAndDelete(_id, { new: true })
        .exec();

      if (!result) {
        throw new NotFoundException(`Player '${_id}' not found`);
      }

      return result;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
