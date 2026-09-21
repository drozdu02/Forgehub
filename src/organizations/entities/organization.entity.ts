import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Relation } from 'typeorm';
import { OrganizationMember } from "./organization-member.entity.js";
import { Project } from "../../projects/entities/project.entity.js";
import { AuditLog } from "../../audit/entities/audit-log.entity.js";

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100})
    name: string;

    @Column({ unique: true })
    slug: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(
        () => OrganizationMember,
        (organizationMember) => organizationMember.organization,
    )
    members: OrganizationMember[];

    @OneToMany(
        () => Project,
        (project) => project.organization,
        {
            onDelete: 'CASCADE'
        }
    )
    projects: Project[];

    @OneToMany(
        () => AuditLog,
        (auditLog) => auditLog.organization
    )
    auditLog: Relation<AuditLog>

}