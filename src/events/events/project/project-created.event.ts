export class ProjectCreatedEvent {
    constructor(
        public readonly projectId: number,
        public readonly organizationId: number,
        public readonly actorUserId: number,
    ){}
}