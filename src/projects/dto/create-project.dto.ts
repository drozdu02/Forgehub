import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;
}
