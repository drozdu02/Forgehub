import { Injectable } from "@nestjs/common";
import { AuditService } from "../../audit.service.js";
import { OnEvent } from "@nestjs/event-emitter";
import { OrganizationCreatedEvent } from "../../../events/events/organization/organization-created.event.js";
import { AuditAction } from "../../enums/audit-action.enum.js";
import { AuditEntityType } from "../../enums/audit-entity-type.enum.js";

@Injectable()
export class OrganizationCreatedAuditListener {
    constructor(
        private readonly auditService: AuditService
    ) {}

    @OnEvent('organization.created')
    async handle(
        event: OrganizationCreatedEvent
    ): Promise<void> {
        await this.auditService.create({
            organizationId: event.organizationId,
            actorUserId: event.actorUserId,
            action: AuditAction.ORGANIZATION_CREATED,
            entityType: AuditEntityType.ORGANIZATION,
            entityId: event.organizationId.toString(),
            eventId: event.eventId.toString(),
            metadata: {
                name: event.name,
                slug: event.slug,
            },
        });
    }
}