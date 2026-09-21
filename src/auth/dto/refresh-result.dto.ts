import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RefreshResultDto {
    @IsNotEmpty()
    @IsString()
    accessToken: string;

    @IsString()
    @IsOptional()
    refreshToken?: string;
}