import { IsISO8601, IsNotEmpty, IsString } from "class-validator";

export class CreateOutboxEventDto {
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    payload: Record<string, unknown>;

    @IsNotEmpty()
    @IsISO8601()
    occuredAt: Date;
}