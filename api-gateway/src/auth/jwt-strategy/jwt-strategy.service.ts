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

      // secretOrKey: configService.get('JWT_SECRET'), // valor estatico

      secretOrKeyProvider: passportJwtSecret({
        jwksUri: `http://host.docker.internal:8000/realms/smartranking/protocol/openid-connect/certs`,
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        handleSigningKeyError(err, cb) {
          console.log('handleSigningKeyError', err);
          cb(err);
        },
      }), // valor dinamico
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
