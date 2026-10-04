import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import type { Relation } from "typeorm";
import { Organization } from "./organization.entity.js";
import { User } from "../../user/entities/user.entity.js";
import { OrganizationRole } from "../enums/organization-role.enum.js";

@Entity('organization_members')
@Unique(['user', 'organization'])
export class OrganizationMember {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User,
    user => user.memberships,
    { onDelete: 'CASCADE' })
    user: Relation<User>;

    @ManyToOne(() => Organization, 
    organization => organization.members, 
    { onDelete: 'CASCADE' })
    organization: Relation<Organization>;

    @Column({ type: 'enum', enum: OrganizationRole, default: OrganizationRole.MEMBER })
    role: OrganizationRole;

    @CreateDateColumn()
    joinedAt: Date;

}