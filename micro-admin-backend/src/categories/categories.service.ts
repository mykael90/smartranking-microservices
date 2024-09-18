import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from '../mongo/schemas/category.schema';
import { Player } from '../mongo/schemas/player.schema';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    @InjectModel('Player')
    private readonly playerModel: Model<Player>,
  ) {}

  private readonly logger = new Logger(CategoriesService.name);

  async createCategory(category: Category): Promise<Category> {
    try {
      const categoryCreated = new this.categoryModel(category);
      return await categoryCreated.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async findCategories(): Promise<Category[]> {
    try {
      return await this.categoryModel.find().populate('players').exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async findCategoryByCategory(category: string): Promise<Category> {
    try {
      const categoryFound = await this.categoryModel
        .findOne({ category })
        .exec();

      if (!categoryFound) {
        throw new NotFoundException(`Category '${category}' not found`);
      }

      return categoryFound;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async findPlayerCategory(_idPlayer: string): Promise<Category> {
    try {
      const players = await this.playerModel.find().exec();

      const playerFiltered = players.filter(
        (player) => player._id == _idPlayer,
      );

      if (playerFiltered.length == 0) {
        throw new NotFoundException(`The id ${_idPlayer} isn't a Player!`);
      }

      this.logger.log(`playerFiltered: ${JSON.stringify(playerFiltered)}`);

      const result = await this.categoryModel
        .findOne()
        .where('players')
        .in(playerFiltered)
        .exec();

      if (!result) {
        throw new NotFoundException(
          `Player ${_idPlayer} not assigned to any Category!`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async updateCategory(
    category: string,
    updateCategoryDto: Category,
  ): Promise<Category> {
    try {
      // Tenta encontrar e atualizar a categoria
      const result = await this.categoryModel
        .findOneAndUpdate(
          { category },
          { $set: updateCategoryDto },
          { new: true },
        )
        .exec();

      if (!result) {
        throw new NotFoundException(`Category '${category}' not found`);
      }

      return result;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async assignPlayerToCategory(params: {
    _idPlayer: string;
    category: string;
  }): Promise<Category> {
    const { category, _idPlayer } = params;

    try {
      const categoryFound = await this.categoryModel
        .findOne({ category })
        .exec();

      if (!categoryFound) {
        throw new NotFoundException(`Category '${category}' not found.`);
      }

      const player = await this.playerModel.findById(_idPlayer).exec();

      if (!player) {
        throw new NotFoundException(`Player '${_idPlayer}' not found.`);
      }

      // TODO: verification not working
      const playerAlreadyInCategory = await this.categoryModel
        .find({ category })
        .where('players')
        .in([player])
        .exec();

      if (playerAlreadyInCategory.length > 0) {
        throw new BadRequestException(
          `Player '${_idPlayer}' already in the category '${category}'`,
        );
      }

      categoryFound.players.push(player);

      const result = await this.categoryModel
        .findOneAndUpdate({ category }, { $set: categoryFound }, { new: true })
        .exec();

      return result;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
