import { Injectable } from "@nestjs/common";
import { AuditService } from "../../audit.service.js";
import { OnEvent } from "@nestjs/event-emitter";
import { UserLoggedInEvent } from "../../../events/events/user/user-logged-in.event.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";

@Injectable()
export class UserLoggedInAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('user.logged-in')
    async handle(
        event: UserLoggedInEvent & { eventId: string }
    ): Promise<void> {
        await this.auditService.create({
            actorUserId: event.userId,
            action: AuditAction.USER_LOGIN,
            entityType: AuditEntityType.USER,
            entityId: event.userId.toString(),
            eventId: event.eventId,
            metadata: {
                email: event.email,
            },
        });
    }
}
