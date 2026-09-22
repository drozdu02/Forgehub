export class RefreshResultDto {
    accessToken: string;
    refreshToken?: string;
    refreshTokenExpiresAt: Date;
}
