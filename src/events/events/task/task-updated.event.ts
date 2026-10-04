import { TaskChanges } from "../interfaces/task-changes.interface.js";

export class TaskUpdatedEvent {
    constructor(
        public readonly taskId: number,
        public readonly projectId: number,
        public readonly organizationId: number,
        public readonly actorUserId: number,
        public readonly changes: TaskChanges,
        public readonly occuredAt: Date,
    ){}
}