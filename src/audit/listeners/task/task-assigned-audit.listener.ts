import { Injectable } from "@nestjs/common";
import { AuditService } from "../../audit.service.js";
import { TaskAssignedEvent } from "../../../events/events/task/task-assigned.event.js";
import { OnEvent } from "@nestjs/event-emitter";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";

@Injectable()
export class TaskAssignedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}


    @OnEvent('task.assigned')
    async handle(
        event: TaskAssignedEvent
    ): Promise<void> {
        await this.auditService.create({
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            action: AuditAction.TASK_ASSIGNED,
            entityType: AuditEntityType.TASK,
            entityId: event.taskId.toString(),
        });
    }
}