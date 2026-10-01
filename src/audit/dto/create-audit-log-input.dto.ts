import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AuditAction } from "../enums/audit-action.enum.js";
import { AuditEntityType } from "../enums/audit-entity-type.enum.js";

export class CreateAuditLogInputDto {
    @IsNotEmpty()
    @IsInt()
    organizationId: number;

    @IsNotEmpty()
    actorUserId: number | null;

    @IsNotEmpty()
    @IsEnum(AuditAction)
    action: AuditAction;

    @IsNotEmpty()
    @IsEnum(AuditEntityType)
    entityType: AuditEntityType;

    @IsNotEmpty()
    entityId: string;

    @IsString()
    eventId?: string | null;

    @IsOptional()
    metadata?: Record<string, unknown>;
}