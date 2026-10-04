import { OrganizationRole } from "../../../organizations/enums/organization-role.enum.js";

export class MemberAddedEvent {
    constructor(
        public readonly organizationId: number,
        public readonly actorUserId: number,    
        public readonly memberUserId: number,
        public readonly role: OrganizationRole,
        public readonly occuredAt: Date,
        public readonly eventId: string,
    ) {}
}