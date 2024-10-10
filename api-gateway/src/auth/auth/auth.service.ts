import { Injectable, Logger } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly httpService: HttpService) {}

  async login(username: string, password: string): Promise<any> {
    this.logger.log(`login: ${username}, ${password}`);
    const { data } = await firstValueFrom(
      this.httpService.post(
        'http://host.docker.internal:8000/realms/smartranking/protocol/openid-connect/token',
        new URLSearchParams({
          client_id: 'nestsr',
          client_secret: 'ZBI4PQCN3Zef7cxwcaF3GvCQc6e7JKvy',
          grant_type: 'password',
          username,
          password,
        }),
      ),
    );
    return data;
  }
}
