import { Injectable } from "@nestjs/common";
import { AuditService } from "../../audit.service.js";
import { OnEvent } from "@nestjs/event-emitter";
import { UserRegisteredEvent } from "../../../events/events/user/user-registered.event.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";

@Injectable()
export class UserRegisteredAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('user.registered')
    async handle(
        event: UserRegisteredEvent
    ): Promise<void> {
        await this.auditService.create({
            actorUserId: event.userId,
            action: AuditAction.USER_REGISTERED,
            entityType: AuditEntityType.USER,
            entityId: event.userId.toString(),
            metadata: {
                email: event.email,
            },
        });
    }
}