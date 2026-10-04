export class OrganizationCreatedEvent {
    constructor(
        public readonly organizationId: string,
        public readonly actorUserId: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly createdAt: Date,
    ) {}
}