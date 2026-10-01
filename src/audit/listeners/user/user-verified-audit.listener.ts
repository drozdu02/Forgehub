import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { AuditService } from "../../audit.service.js";
import { UserVerifiedEvent } from "../../../events/events/user/email-verified.event.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";

@Injectable()
export class UserVerifiedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('user.verified')
    async handle(
        event: UserVerifiedEvent
    ): Promise<void> {
        await this.auditService.create({
            actorUserId: event.userId,
            action: AuditAction.USER_VERIFIED,
            entityType: AuditEntityType.USER,
            entityId: event.userId.toString(),
            metadata: {
                email: event.email,
            },
        });
    }
}
