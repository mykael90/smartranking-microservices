import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EmailModule } from '../email/email.module'; // Importa o módulo de e-mail
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { SmsModule } from '../sms/sms.module';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  imports: [EmailModule, WhatsappModule, SmsModule], // Importa o EmailModule para ter acesso ao EmailService
})
export class NotificationsModule {}
