import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity.js";
import { Task } from "../../tasks/entities/task.entity.js";

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100})
    name: string

    @Column({ unique: true })
    slug: string

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @ManyToOne(
        () => Organization,
        (organization) => organization.projects,
        {
            onDelete: 'CASCADE'
        }
    )
    organization: Relation<Organization>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(
        () => Task,
        (task) => task.project,
    )
    tasks: Relation<Task[]>;

}