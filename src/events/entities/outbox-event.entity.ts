import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('outbox_events')
export class OutboxEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: string;

    @Column({ type: 'jsonb' })
    payload: Record<string, unknown>;

    @Column({ type: 'timestamptz' })
    occuredAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    processedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;
}