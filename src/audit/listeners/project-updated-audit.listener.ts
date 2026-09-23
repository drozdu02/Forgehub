import { Injectable } from "@nestjs/common";
import { AuditService } from "../audit.service.js";
import { OnEvent } from "@nestjs/event-emitter";
import { ProjectUpdatedEvent } from "../../events/events/project/project-updated.event.js";
import { AuditAction } from "../enums/audit-action.enum.js";
import { AuditEntityType } from "../enums/audit-entity-type.enum.js";

@Injectable()
export class ProjectUpdatedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('project.updated')
    async handle(
        event: ProjectUpdatedEvent
    ): Promise<void> {
        await this.auditService.create({
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            action: AuditAction.PROJECT_UPDATED,
            entityType: AuditEntityType.PROJECT,
            entityId: event.projectId.toString(),
        });
    }
}