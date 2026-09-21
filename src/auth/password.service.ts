import * as argon2 from 'argon2';

export class PasswordService {


    async hash(
        password: string
    ): Promise<string> {
        return await argon2.hash(
            password, {
                type: argon2.argon2id,
            }
        );
    }

    async verify(
        hashedPassword: string,
        password: string
    ): Promise<boolean> {
        return await argon2.verify(
            hashedPassword,
            password
        );
    }
}