export interface EmailProvider {
    sendVerificationEmail(
        input: {
            to: string;
            code: string;
        }
    ): Promise<void>;
}