import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import { Category } from '../mongo/schemas/category.schema';
import { Player } from '../mongo/schemas/player.schema';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    @InjectModel('Player')
    private readonly playerModel: Model<Player>,
    @InjectConnection() private readonly connection: Connection, // Injeta a conexão do Mongoose
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

    // Inicia uma sessão para a transação
    // const session: ClientSession = await this.connection.startSession();

    // session.startTransaction();

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

      // update players field on category
      const updatedCategory = await this.categoryModel
        .findByIdAndUpdate(
          categoryFound._id,
          { $set: categoryFound },
          { new: true },
        )
        .exec();

      console.log('categoryFound: ', categoryFound);

      // update category field on player
      player.category = categoryFound;

      await this.playerModel
        .findOneAndUpdate({ _id: _idPlayer }, { $set: player })
        .exec();

      // Confirma a transação
      // await session.commitTransaction();

      // Finaliza a sessão
      // session.endSession();

      return updatedCategory;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      // await session.abortTransaction();
      // session.endSession();

      throw new RpcException(error.message);
    }
  }
}
