import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, MaxLength } from "class-validator";
import { TaskPriority } from "../enums/task-priority.enum.js";
import { TaskStatus } from "../enums/task-status.enum.js";

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsOptional()
    @IsEnum(TaskStatus)
    taskStatus?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority)
    taskPriority?: TaskPriority;

    @IsOptional()
    @IsISO8601()
    deadline?: string | null;

    @IsOptional()
    @IsInt()
    assigneeId?: number | null;
}
