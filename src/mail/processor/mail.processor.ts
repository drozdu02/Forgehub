import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject } from "@nestjs/common";
import { Job } from "bullmq";
import { EMAIL_PROVIDER } from "../constants/email-provider.constant.js";
import type { EmailProvider } from "../providers/email.provider.js";

@Processor('mail')
export class MailProcessor extends WorkerHost {

    constructor(
        @Inject(EMAIL_PROVIDER)
        private readonly emailProvider: EmailProvider
    ) {
        super();
    }

    async process(
        job: Job
    ): Promise<void> {
        if (job.name === 'send-verification-email') {
            await this.emailProvider.sendVerificationEmail({
                to: job.data.email,
                code: job.data.code,
            });
            return;
        }
        throw new Error(
            `Unknown mail job: ${job.name}`
        );
    }

    
}