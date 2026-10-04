import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OutboxEvent } from "./entities/outbox-event.entity.js";
import { EntityManager, Repository } from "typeorm";
import { CreateOutboxEventDto } from "./dto/create-outbox-event.dto.js";

@Injectable()
export default class OutboxService {
    constructor(
        @InjectRepository(OutboxEvent)
        private readonly outboxEventRepository: Repository<OutboxEvent>,
    ) {}

    async create(
        createOutboxEventDto: CreateOutboxEventDto,
        manager?: EntityManager
    ): Promise<OutboxEvent> {
        const repository = manager
            ? manager.getRepository(OutboxEvent)
            : this.outboxEventRepository;
        
            const event = repository.create({
                type: createOutboxEventDto.type,
                payload: createOutboxEventDto.payload,
                occuredAt: createOutboxEventDto.occuredAt,
                processedAt: null
            });

            return repository.save(event);
    }
}