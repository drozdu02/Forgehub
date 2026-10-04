import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    slug?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    organizationId?: number;
}
