import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { Category } from './schemas/categories/category.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  logger = new Logger(AppController.name);

  @EventPattern('create-category')
  async createCategory(@Payload() category: Category) {
    this.logger.log(`category: ${JSON.stringify(category)}`);

    return this.appService.createCategory(category);
  }

  @MessagePattern('find-categories')
  async findCategories(@Payload() params: string[]) {
    const category = params['category'];

    if (category) {
      return await this.appService.findCategoryByCategory(category);
    }

    return await this.appService.findCategories();
  }
}
