import { TaskStatus } from "../../../tasks/enums/task-status.enum.js";

export class TaskStatusChangedEvent {
    constructor(
        public readonly taskId: number,
        public readonly projectId: number,
        public readonly organizationId: number,
        public readonly actorUserId: number,
        public readonly oldStatus: TaskStatus,
        public readonly newStatus: TaskStatus,
        public readonly occuredAt: Date,
    ){}
}