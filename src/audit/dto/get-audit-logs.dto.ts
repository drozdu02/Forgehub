import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { AuditAction } from "../enums/audit-action.enum.js";
import { AuditEntityType } from "../enums/audit-entity-type.enum.js";

export class GetAuditLogsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsEnum(AuditAction)
    action?: AuditAction;

    @IsOptional()
    @IsEnum(AuditEntityType)
    entityType?: AuditEntityType;

    


}