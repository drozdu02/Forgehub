import { OnEvent } from "@nestjs/event-emitter";
import { AuditService } from "../../audit.service.js";
import { TaskUpdatedEvent } from "../../../events/events/task/task-updated.event.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TaskUpdatedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('task.updated')
    async handle(
        event: TaskUpdatedEvent
    ): Promise<void> {
        await this.auditService.create({
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            action: AuditAction.TASK_UPDATED,
            entityType: AuditEntityType.TASK,
            entityId: event.taskId.toString(),
        });
    }
}