import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/categories/category.schema';
import { Player } from './schemas/players/player.schema';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    @InjectModel('Player')
    private readonly playerModel: Model<Player>,
  ) {}

  private readonly logger = new Logger(AppService.name);

  async createCategory(category: Category): Promise<Category> {
    // const { category } = category;

    try {
      const categoryCreated = new this.categoryModel(category);
      return await categoryCreated.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async findCategories(): Promise<Category[]> {
    return await this.categoryModel.find().populate('players').exec();
  }

  async findCategoryByCategory(category: string): Promise<Category> {
    const categoryFound = await this.categoryModel.findOne({ category }).exec();

    if (!categoryFound) {
      throw new NotFoundException(`Category '${category}' not found`);
    }

    return categoryFound;
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

  // async updateCategory(
  //   category: string,
  //   updateCategoryDto: UpdateCategoryDto,
  // ): Promise<void> {
  //   const categoryExists = await this.categoryModel
  //     .findOne({ category })
  //     .exec();

  //   if (!categoryExists) {
  //     throw new NotFoundException(`Category '${category}' not found`);
  //   }

  //   await this.categoryModel
  //     .findOneAndUpdate({ category }, { $set: updateCategoryDto })
  //     .exec();
  // }

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
