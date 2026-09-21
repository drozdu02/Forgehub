import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "../../user/entities/user.entity.js";

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'family_id', type: 'uuid' })
    familyId: string;

    @ManyToOne(
        () => User,
        (user) => user.sessions, {
            onDelete: 'CASCADE'
        },
    )
    user: Relation<User>;

    @Column({ name: 'refresh_token_hash' })
    refreshTokenHash: string

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
    revokedAt: Date | null;

    @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true})
    lastUsedAt: Date | null;

    @Column({ name: 'replaced_by_session_id', type: 'uuid', nullable: true })
    replacedBySessionId: string | null;
}