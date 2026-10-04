import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {

    constructor(
    @InjectQueue('mail')
    private readonly mailQueue: Queue
    ) {}

    async enqueueVerificationEmail(
        userId: number,
        email: string,
        code: string
    ): Promise<void> {
        await this.mailQueue.add(
            'send-verification-email',
            {
                userId,
                email,
                code
            },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000
                },
            },
        );
    }
}
