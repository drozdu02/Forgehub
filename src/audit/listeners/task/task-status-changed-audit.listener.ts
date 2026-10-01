import { Injectable } from "@nestjs/common";
import { AuditService } from "../../audit.service.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { TaskStatusChangedEvent } from "../../../events/events/task/task-status-changed.event.js";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class TaskStatusChangedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('task.status-changed')
    async handle(
        event: TaskStatusChangedEvent
    ): Promise<void> {
        await this.auditService.create({
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            action: AuditAction.TASK_STATUS_CHANGED,
            entityType: AuditEntityType.TASK,
            entityId: event.taskId.toString(),
        });
    }
}