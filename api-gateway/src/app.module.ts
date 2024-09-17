import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeOutInterceptor } from './common/interceptors/timeout.interceptor';
import { PlayersModule } from './players/players.module';
import { CategoriesModule } from './categories/categories.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
@Module({
  imports: [RabbitMQModule, PlayersModule, CategoriesModule],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeOutInterceptor,
    },
  ],
})
export class AppModule {}
