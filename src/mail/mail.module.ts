import { Module } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { MailController } from './mail.controller.js';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './processor/mail.processor.js';
import { AwsSesProvider } from './providers/aws-ses.provider.js';
import { EMAIL_PROVIDER } from './constants/email-provider.constant.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [MailController],
  providers: [
    MailService, 
    MailProcessor, 
    AwsSesProvider,
    {
      provide: EMAIL_PROVIDER,
      useExisting: AwsSesProvider
    }
  ],
  exports: [MailService]
})
export class MailModule {}
