import { Injectable } from "@nestjs/common";
import { AuditService } from "../../audit.service.js";
import { OnEvent } from "@nestjs/event-emitter";
import { TaskCreatedEvent } from "../../../events/events/task/task-created.event.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";

@Injectable()
export class TaskCreatedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('task.created')
    async handle(
        event: TaskCreatedEvent
    ): Promise<void> {
        await this.auditService.create({
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            action: AuditAction.TASK_CREATED,
            entityType: AuditEntityType.TASK,
            entityId: event.taskId.toString(),
        });
    }
}