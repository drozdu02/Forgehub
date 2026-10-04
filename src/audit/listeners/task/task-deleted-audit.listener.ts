import { Injectable } from "@nestjs/common";
import { AuditService } from "../../audit.service.js";
import { TaskDeletedEvent } from "../../../events/events/task/task-deleted.event.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class TaskDeletedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('task.deleted')
    async handle(
        event: TaskDeletedEvent & { eventId: string }
    ): Promise<void> {
        await this.auditService.create({
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            action: AuditAction.TASK_DELETED,
            entityType: AuditEntityType.TASK,
            entityId: event.taskId.toString(),
            eventId: event.eventId,
        });
    }
}