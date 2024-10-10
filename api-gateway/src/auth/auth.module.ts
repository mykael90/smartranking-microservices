import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategyService } from './jwt-strategy/jwt-strategy.service'; // Importa o JWT strategy configurado
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { HttpModule } from '@nestjs/axios';

import './depracated_auth-config.service';

@Module({
  imports: [HttpModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [AuthService, JwtStrategyService],
  exports: [],
  controllers: [AuthController],
})
export class AuthModule {}
