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
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RoleGuard } from '../../common/guards/role.guard';

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

  @Roles(Role.Admin)
  @UseGuards(JwtGuard, RoleGuard)
  @Get('test-auth')
  async testAuth(@Req() req: Request & { user: any }) {
    this.logger.log(`Authenticated user: ${JSON.stringify(req.user)}`);
    return 'test-auth';
  }
}
