import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class LoginResponseDto {
    @IsString()
    @IsNotEmpty()
    accessToken: string;
    
    @IsString()
    @IsOptional()
    refreshToken?: string;
}