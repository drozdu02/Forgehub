export interface TaskChanges {
    name?: {
        oldValue: string;
        newValue: string;
    };

    description?: {
        oldValue: string | null;
        newValue: string | null;
    },

    priority?: {
        oldValue: TaskPriority;
        newValue: TaskPriority;
    },

    deadline?: {
        oldValue: Date | null;
        newValue: Date | null;
    },

    assigneeId?: {
        oldValue: number | null;
        newValue: number | null;
    }

}