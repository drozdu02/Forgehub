import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor('mail')
export class MailProcessor extends WorkerHost {

    async process(
        job: Job
    ): Promise<void> {
        if (job.name === 'send-verification-email') {
            await this.sendVerificationEmail(job);
        }
        return;
    }

    private async sendVerificationEmail(
        job: Job
    ): Promise<void> {
        console.log(
            'Sending verification email',
            job.data
        );
    }
}