import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "../../user/entities/user.entity.js";

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
        (user) => user.sessions, {
            onDelete: 'CASCADE'
        },
    )
    user: Relation<User>;

    @Column({name: 'refresh_token_hash'})
    refreshTokenHash: string

    @Column({type: 'timestamptz'})
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @Column({type: 'timestamptz', nullable: true})
    revokedAt: Date | null;

    @Column({ type: 'timestamptz', nullable: true})
    lastUsedAt: Date | null;
}