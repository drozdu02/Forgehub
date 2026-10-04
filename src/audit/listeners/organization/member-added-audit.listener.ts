import { Injectable } from "@nestjs/common";
import { AuditService } from "../../audit.service.js";
import { OnEvent } from "@nestjs/event-emitter";
import { MemberAddedEvent } from "../../../events/events/organization/member-added.event.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";

@Injectable()
export class MemberAddedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('organization.member.added')
    async handle(
        event: MemberAddedEvent
    ): Promise<void> {
        await this.auditService.create({
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            action: AuditAction.MEMBER_ADDED,
            entityType: AuditEntityType.ORGANIZATION,
            entityId: event.organizationId.toString(),
            eventId: event.eventId.toString(),
            metadata: {
                memberUserId: event.memberUserId,
                role: event.role,
            },
        })
    }
}