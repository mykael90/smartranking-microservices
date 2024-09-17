import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  // async findPlayerCategory(_idPlayer: any): Promise<Category> {
  //   const players = await this.playersService.findPlayers();

  //   const playerFiltered = players.filter((player) => player._id == _idPlayer);

  //   if (playerFiltered.length === 0) {
  //     throw new BadRequestException(`The id ${_idPlayer} isn't a Player!`);
  //   }

  //   return await this.categoryModel
  //     .findOne()
  //     .where('players')
  //     .in(_idPlayer)
  //     .exec();
  // }

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

  // async assignPlayerToCategory(params: string[]): Promise<void> {
  //   const category = params['category'];
  //   const _idPlayer = params['_idPlayer'];

  //   const categoryFound = await this.categoryModel.findOne({ category }).exec();
  //   const playerAlreadyInCategory = await this.categoryModel
  //     .find({ category })
  //     .where('players')
  //     .in(_idPlayer)
  //     .exec();

  //   await this.playersService.findPlayerById(_idPlayer);

  //   if (!categoryFound) {
  //     throw new BadRequestException(`Category '${category}' not registered.`);
  //   }

  //   if (playerAlreadyInCategory.length > 0) {
  //     throw new BadRequestException(
  //       `Player '${_idPlayer}' already in the category '${category}'`,
  //     );
  //   }

  //   categoryFound.players.push(_idPlayer);

  //   await this.categoryModel
  //     .findOneAndUpdate({ category }, { $set: categoryFound })
  //     .exec();
  // }
}
