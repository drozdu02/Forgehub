export class LoginResponseDto {
    accessToken: string;
    refreshToken?: string;
    refreshTokenExpiresAt: Date;
}
