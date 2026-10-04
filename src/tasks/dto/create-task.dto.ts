import { IsEnum, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { TaskPriority } from "../enums/task-priority.enum.js";
import { Type } from "class-transformer";

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
    

    @IsOptional()
    @IsEnum(TaskPriority)
    taskPriority?: TaskPriority;

    @IsOptional()
    @IsISO8601()
    deadline?: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    assigneeId?: number;
}
