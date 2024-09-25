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

  findOne(_id: string): Promise<Player> {
    try {
      return this.playerModel.findById(_id).exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  update(_id: string, updatePlayerDto: Player): Promise<Player> {
    try {
      const result = this.playerModel
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
