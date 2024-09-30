import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    email: string,
    subject: string,
    template: string,
    context: any,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template, // Nome do template (sem a extensão .pug)
        context, // Contexto para preencher variáveis no template
      });
      this.logger.log(
        `email sent to ${email}, subject: ${subject}, template: ${template}, context: ${JSON.stringify(context)}`,
      );
      return true;
    } catch (error) {
      console.error(`Fail to send email to ${email}:`, error);
      throw error;
    }
  }
}
