import { IsNotEmpty, IsString } from "class-validator";

export class LogoutResponseDto {
    @IsString()
    @IsNotEmpty()
    message: string;
}