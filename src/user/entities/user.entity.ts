import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Relation } from "typeorm";
import { OrganizationMember } from "../../organizations/entities/organization-member.entity.js";
import { Task } from "../../tasks/entities/task.entity.js";
import { Session } from "../../auth/entities/session.entity.js";
import { EmailVerificationCode } from "../../auth/entities/email-verification-code.entity.js";
import { AuditLog } from "../../audit/entities/audit-log.entity.js";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(
        () => OrganizationMember,
        organizationMember => organizationMember.user,
    )
    memberships: Relation<OrganizationMember[]>;

    @OneToMany(
        () => Task,
        (task) => task.assignee
    )
    tasks: Relation<Task[]>;

    @OneToMany(
        () => Session,
        (session) => session.user
    )
    sessions: Relation<Session[]>;

    @OneToMany(
        () => EmailVerificationCode,
        (emailVerificationCode) => emailVerificationCode.user
    )
    emailVerificationCodes: Relation<EmailVerificationCode[]>;

    @OneToMany(
        () => AuditLog,
        (auditLog) => auditLog.actor
    )
    auditLogs: Relation<AuditLog[]>;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    emailVerifiedAt: Date | null;

}


