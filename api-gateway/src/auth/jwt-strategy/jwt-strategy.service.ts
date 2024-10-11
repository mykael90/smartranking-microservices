import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Logger, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy, 'jwt') {
  private logger = new Logger(JwtStrategyService.name);

  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      algorithm: 'RS256',

      // secretOrKey: configService.get('JWT_SECRET'), // valor estatico da variável de ambiente

      secretOrKeyProvider: passportJwtSecret({
        jwksUri: `${configService.get<string>('KC_PROTOCOL')}://${configService.get<string>('KC_HOST')}:${configService.get<string>('KC_PORT')}/realms/${configService.get<string>('KC_REALM')}/protocol/openid-connect/certs`,
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        handleSigningKeyError(err, cb) {
          console.log('handleSigningKeyError', err);
          cb(err);
        },
      }), // valor dinamico obtido pelo endpoint do jwks do keycloak
    });
  }

  async validate(payload: any) {
    if (!payload) {
      this.logger.error('JWT payload ausente');
      throw new UnauthorizedException('Token inválido ou ausente');
    }

    this.logger.log(`payload: ${JSON.stringify(payload)}`);

    return payload;
  }
}
