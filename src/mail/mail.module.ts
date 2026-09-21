import { Module } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { MailController } from './mail.controller.js';
import { BullModule } from '@nestjs/bullmq';
import { MailProcessor } from './processor/mail.processor.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  controllers: [MailController],
  providers: [MailService, MailProcessor],
  exports: [MailService]
})
export class MailModule {}
