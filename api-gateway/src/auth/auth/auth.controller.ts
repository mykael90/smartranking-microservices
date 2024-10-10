import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';

@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    this.logger.log(`login: ${username}, ${password}`);
    return await this.authService.login(username, password);
  }

  @UseGuards(JwtGuard)
  @Get('test-auth')
  async testAuth(@Req() req: Request & { user: any }) {
    this.logger.log(`Authenticated user: ${JSON.stringify(req.user)}`);
    return 'test-auth';
  }
}
