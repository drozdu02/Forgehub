import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from 'typeorm';
import { Organization } from "../../organizations/entities/organization.entity.js";
import { User } from "../../user/entities/user.entity.js";
import { AuditAction } from "../enums/audit-action.enum.js";
import { AuditEntityType } from "../enums/audit-entity-type.enum.js";

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => Organization,
        {
            onDelete: 'CASCADE'
        },
    )
    organization: Relation<Organization>

    @ManyToOne(
        () => User,
        {
            nullable: true,
            onDelete: 'SET NULL'
        }
    )
    actor: User | null;

    @Column({ type: 'enum', enum: AuditAction })
    action: AuditAction;

    @Column({ type: 'enum', enum: AuditEntityType })
    entityType: AuditEntityType;

    @Column({ length: 100 })
    entityId: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, unknown> | null;

    @CreateDateColumn()
    createdAt: Date;

}