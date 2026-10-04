import { Injectable } from "@nestjs/common";
import { AuditService } from "../../audit.service.js";
import { OnEvent } from "@nestjs/event-emitter";
import { MemberRemovedEvent } from "../../../events/events/organization/member-removed.event.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";

@Injectable()
export class MemberRemovedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('organization.member.removed')
    async handle(
        event: MemberRemovedEvent
    ): Promise<void> {
        await this.auditService.create(
            {
                organizationId: event.organizationId,
                actorUserId: event.actorUserId,
                action: AuditAction.MEMBER_REMOVED,
                entityType: AuditEntityType.ORGANIZATION,
                entityId: event.organizationId.toString(),
                eventId: event.eventId.toString(),
                metadata: {
                    memberUserId: event.memberUserId,
                    role: event.role,
                },
            },
        );
    }
}