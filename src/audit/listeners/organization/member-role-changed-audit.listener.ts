import {  Injectable } from "@nestjs/common";
import { AuditService } from "../../audit.service.js";
import { OnEvent } from "@nestjs/event-emitter";
import { MemberRoleChangedEvent } from "../../../events/events/organization/member-role-changed.event.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";

@Injectable()
export class MemberRoleChangedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('organization.member.role.changed')
    async handle(
        event: MemberRoleChangedEvent
    ): Promise<void> {
        await this.auditService.create({
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            action: AuditAction.MEMBER_ROLE_CHANGED,
            entityType: AuditEntityType.ORGANIZATION,
            entityId: event.organizationId.toString(),
            eventId: event.eventId.toString(),
            metadata: {
                memberUserId: event.memberUserId,
                oldRole: event.oldRole,
                newRole: event.newRole,
            },
        });
    }
}