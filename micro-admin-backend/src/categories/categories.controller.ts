import { Controller, Logger } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { Category } from '../mongo/schemas/category.schema';

const ackErrors: string[] = [];

ackErrors.push('E11000'); // allow ack when duplicate error of key on mongodb
ackErrors.push('not found'); // allow ack when not found (incorrect category or id)

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  logger = new Logger(CategoriesController.name);

  @EventPattern('create-category')
  async createCategory(
    @Payload() category: Category,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    this.logger.log(`create category: ${JSON.stringify(category)}`);

    try {
      await this.categoriesService.createCategory(category);

      return await channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) {
        await channel.ack(originalMsg);
        throw new RpcException(`error: ${JSON.stringify(error.message)}`); // Throwing exception to notify the client
        // return error;
      }

      await channel.nack(originalMsg);
    }
  }

  @MessagePattern('find-categories')
  async findCategories(
    @Payload() params: string[],
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    const category = params['category'];

    try {
      const result = category
        ? await this.categoriesService.findCategoryByCategory(category)
        : await this.categoriesService.findCategories();

      channel.ack(originalMsg); // Ack no sucesso
      return result;
    } catch (error) {
      this.logger.error(`error: ${error.message}`);

      await channel.ack(originalMsg); //GET handler, I'll discard even with error, no data lost

      throw new RpcException('Failed to retrieve categories');
    }
  }

  @MessagePattern('update-category')
  async updateCategory(
    @Payload() payload: { updateCategoryDto: Category; category: string },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    this.logger.log(`upload category: ${JSON.stringify(payload.category)}`);
    this.logger.log(JSON.stringify(payload.updateCategoryDto));

    try {
      const result = await this.categoriesService.updateCategory(
        payload.category,
        payload.updateCategoryDto,
      );

      channel.ack(originalMsg);
      return result;
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);

      const filterAckError = ackErrors.filter((ackError) =>
        error.message.includes(ackError),
      );

      if (filterAckError.length > 0) {
        channel.ack(originalMsg);
        throw new RpcException(error.message); // Throwing exception to notify the client
      }

      channel.nack(originalMsg);
      throw new RpcException('Failed to update category');
    }
  }
}
