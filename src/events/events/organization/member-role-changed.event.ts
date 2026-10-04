import { OrganizationRole } from "../../../organizations/enums/organization-role.enum.js";

export class MemberRoleChangedEvent {
    constructor(
        public readonly organizationId: number,
        public readonly actorUserId: number,
        public readonly memberUserId: number,
        public readonly oldRole: OrganizationRole,
        public readonly newRole: OrganizationRole,
        public readonly occuredAt: Date,
        public readonly eventId: string,
    ) {}
}