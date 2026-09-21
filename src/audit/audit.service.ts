import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity.js';
import { Repository } from 'typeorm';
import { CreateAuditLogInputDto } from './dto/create-audit-log-input.dto.js';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,

    ) {}

    async create(
        createAuditLogInputDto: CreateAuditLogInputDto
    ): Promise<AuditLog> {
        const auditLog = this.auditLogRepository.create({
            organization: {
                id: createAuditLogInputDto.organizationId
            },
            actor: createAuditLogInputDto.actorUserId ? { id: createAuditLogInputDto.actorUserId } : null,
            action: createAuditLogInputDto.action,
            entityType: createAuditLogInputDto.entityType,
            entityId: createAuditLogInputDto.entityId,
            metadata: createAuditLogInputDto.metadata ?? null,
        });
        return this.auditLogRepository.save(auditLog);
    }
}
