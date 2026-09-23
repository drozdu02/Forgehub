export class TaskAssignedEvent {
    constructor(
        public readonly taskId: number,
        public readonly projectId: number,
        public readonly organizationId: number,
        public readonly actorUserId: number,
        public readonly previousAssigneeId: number | null,
        public readonly newAssigneeId: number | null,
        public readonly occuredAt: Date,
    ){}
}