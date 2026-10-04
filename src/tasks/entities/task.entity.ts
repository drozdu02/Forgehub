import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Relation } from "typeorm";
import { TaskStatus } from "../enums/task-status.enum.js";
import { TaskPriority } from "../enums/task-priority.enum.js";
import { Project } from "../../projects/entities/project.entity.js";
import { User } from "../../user/entities/user.entity.js";

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100}) 
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
    taskStatus: TaskStatus;

    @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
    taskPriority: TaskPriority;

    @Column({ nullable: true, type: 'timestamptz' })
    deadline: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
        () => Project,
        (project) => project.tasks,
        {
            onDelete: 'CASCADE'
        }
    )
    project: Relation<Project>;

    @ManyToOne(
        () => User,
        (user) => user.tasks,
        {
            onDelete: 'SET NULL'
        }
    )
    assignee: Relation<User> | null;
}