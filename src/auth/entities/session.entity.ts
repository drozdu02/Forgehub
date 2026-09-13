import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
    user: User;

    @Column({name: 'refresh_token_hash'})
    refreshTokenHash: string

    @Column({type: 'timestamp'})
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @Column({type: 'timestamptz', nullable: true})
    revokedAt: Date | null;
}