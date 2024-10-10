import { passportJwtSecret } from 'jwks-rsa';

export class AuthConfigService {
  private readonly keycloakIssuer =
    'https://host.docker.internal:8000/realms/smartranking';
  private readonly clientId = 'nestsr';

  getJwtConfig() {
    const config = {
      issuer: this.keycloakIssuer,
      audience: this.clientId,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        jwksUri: `${this.keycloakIssuer}/protocol/openid-connect/certs`,
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
      }),
    };

    console.log(`config: ${JSON.stringify(config)}`);

    return config;
  }
}
