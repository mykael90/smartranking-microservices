import { NestFactory } from '@nestjs/core';
import * as momentTimezone from 'moment-timezone';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { Logger } from '@nestjs/common';
import { log } from 'console';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  Date.prototype.toJSON = function (): any {
    return momentTimezone(this)
      .tz('America/Sao_Paulo')
      .format('YYYY-MM-DD HH:mm:ss.SSS');
  };
  await app.listen(8080);

  logger.log(`Api-Gateway is listening on port 8080`);

  // Se o modo de desenvolvimento estiver ativo, inicie o debugger manualmente
  if (process.env.ENV === 'dev') {
    const inspector = await import('inspector');
    inspector.open(9229, '0.0.0.0'); // Abra o debugger na porta 9229 para todas as interfaces
    logger.log('Debugger listening on port 9229');
  }
}
bootstrap();
