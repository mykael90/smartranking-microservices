import { Injectable, Logger } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly kcProtocol: string;
  private readonly kcHost: string;
  private readonly kcPort: string;
  private readonly kcRealm: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.configService.get<string>('KC_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('KC_CLIENT_SECRET');
    this.kcProtocol = this.configService.get<string>('KC_PROTOCOL');
    this.kcHost = this.configService.get<string>('KC_HOST');
    this.kcPort = this.configService.get<string>('KC_PORT');
    this.kcRealm = this.configService.get<string>('KC_REALM');
  }

  async login(username: string, password: string): Promise<any> {
    this.logger.log(`login: ${username}, ${password}`);
    const { data } = await firstValueFrom(
      this.httpService.post(
        `${this.kcProtocol}://${this.kcHost}:${this.kcPort}/realms/${this.kcRealm}/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'password',
          username,
          password,
        }),
      ),
    );
    return data;
  }
}
