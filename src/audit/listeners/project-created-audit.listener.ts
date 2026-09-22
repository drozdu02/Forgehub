import { Injectable } from "@nestjs/common";
import { AuditService } from "../audit.service.js";
import { OnEvent } from "@nestjs/event-emitter";
import { ProjectCreatedEvent } from "../../events/events/project/project-created.event.js";
import { AuditAction } from "../enums/audit-action.enum.js";
import { AuditEntityType } from "../enums/audit-entity-type.enum.js";

@Injectable()
export class ProjectCreatedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('project.created')
    async handle(
        event: ProjectCreatedEvent
    ): Promise<void> {
        await this.auditService.create({
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            action: AuditAction.PROJECT_CREATED,
            entityType: AuditEntityType.PROJECT,
            entityId: event.projectId.toString()
        });
    }
}