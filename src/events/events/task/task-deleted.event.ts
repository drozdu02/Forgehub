export class TaskDeletedEvent {
    constructor(
        public readonly taskId: number,
        public readonly projectId: number,
        public readonly organizationId: number,
        public readonly actorUserId: number,
        public readonly occuredAt: Date,
    ){}
}