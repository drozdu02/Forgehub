export class OrganizationCreatedEvent {
    constructor(
        public readonly organizationId: number,
        public readonly actorUserId: number,
        public readonly name: string,
        public readonly slug: string,
        public readonly occuredAt: Date,
        public readonly eventId: string,
    ) {}
}