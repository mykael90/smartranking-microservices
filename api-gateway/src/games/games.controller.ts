import { Controller, Logger } from '@nestjs/common';

@Controller('games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name);

  constructor() {}
}
