import { Injectable } from "@nestjs/common";
import { EmailProvider } from "./email.provider.js";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AwsSesProvider implements EmailProvider {
    private readonly client: SESv2Client;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.client = new SESv2Client({
            region: this.configService.getOrThrow<string>(
                'AWS_REGION'
            ),
        });
    }

    async sendVerificationEmail(
        input: {
            to: string,
            code: string
        },
    ): Promise<void> {
        const fromEmail = this.configService.getOrThrow<string>(
            'AWS_SES_FROM_EMAIL'
        );

        const command = new SendEmailCommand({
            FromEmailAddress: fromEmail,
            Destination: {
                ToAddresses: [input.to],
            },
            Content: {
                Simple: {
                    Subject: {
                        Data: 'Forgehub email verification',
                        Charset: 'UTF-8'
                    },
                    Body: {
                        Text: {
                            Data: `Your Forgehub email verification code is: 
                            ${input.code}. 
                            This code expires in 10 minutes.`.trim(),
                            Charset: 'UTF-8'
                        },
                        Html: {
                            Data: 
                                `
                                <h1>Forgehub</h1>
                                <p>
                                    Your email verification code is:
                                </p>
                                
                                <h2>${input.code}</h2>

                                <p>
                                    This code expires in 10 minutes.
                                </p>
                                `,
                            Charset: 'UTF-8',
                        },
                    },
                },
            },
        });
        await this.client.send(command);
    }
}