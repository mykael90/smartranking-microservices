import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAILER_HOST'),
          port: config.get<number>('MAILER_PORT', 587), // Valor padrão de 587
          auth: {
            user: config.get<string>('MAILER_USER'),
            pass: config.get<string>('MAILER_PASS'),
          },
        },
        defaults: {
          from: `"Smart Ranking Messenger" <${config.get<string>('MAILER_USER')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'), // Diretório dos templates Pug
          adapter: new PugAdapter(), // Usar o adaptador Pug
          options: {
            strict: true,
            pretty: true, // Faz a saída do HTML mais legível
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
