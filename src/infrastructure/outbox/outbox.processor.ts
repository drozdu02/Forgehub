import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { IsNull, Repository } from "typeorm";
import { OutboxEvent } from "./entities/outbox-event.entity.js";
import { InjectRepository } from "@nestjs/typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class OutboxProcessor implements OnModuleInit, OnModuleDestroy {
    private interval: NodeJS.Timeout | null = null;

    constructor(
        @InjectRepository(OutboxEvent)
        private readonly outboxEventRepository: Repository<OutboxEvent>,

        private readonly eventEmitter: EventEmitter2,
    ) {}

    onModuleInit(): void {
        this.interval = setInterval(
            () => {
                void this.processEvents();
            },
            500
        );
    }

    onModuleDestroy(): void {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    private async processEvents(): Promise<void> {
        const events = await this.outboxEventRepository.find({
            where: {
                processedAt: IsNull()
            },
            order: {
                createdAt: 'ASC'
            },
            take: 50
        });

        for (const event of events) {
            await this.processEvent(event);
        }
    }

    private async processEvent(
        event: OutboxEvent
    ): Promise<void> {
        this.eventEmitter.emit(
            event.type,
            event.payload
        );

        event.processedAt = new Date();

        await this.outboxEventRepository.save(event);
    }
}