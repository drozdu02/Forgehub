import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "../../user/entities/user.entity.js";

@Entity('email_verification_codes')
export class EmailVerificationCode {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(
        () => User,
        user => user.emailVerificationCodes,
    )
    user: Relation<User>;

    @Column()
    codeHash: string;

    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @Column({ type: 'timestamptz', nullable: true})
    usedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

}