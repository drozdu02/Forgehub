import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity.js';
import { Repository } from 'typeorm';
import { CreateAuditLogInputDto } from './dto/create-audit-log-input.dto.js';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto.js';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,

    ) {}

    async create(
        createAuditLogInputDto: CreateAuditLogInputDto
    ): Promise<AuditLog> {
        if (createAuditLogInputDto.eventId) {
            const existing = await this.auditLogRepository.findOne({
                where: {
                    eventId: createAuditLogInputDto.eventId
                },
            });
        }
        const auditLog = this.auditLogRepository.create({
            eventId: createAuditLogInputDto.entityId ?? null,
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

    async getForOrganization(
        organizationId: number,
        query: GetAuditLogsDto
    ) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const queryBuilder = this.auditLogRepository
            .createQueryBuilder('audit')
            .where(
                'audit.organization_id = :organizationId', {
                    organizationId
                }
            )
            .orderBy(
                'audit.created_at',
                'DESC'
            )
            .skip((page - 1) * limit)
            .take(limit);
        
        if (query.action) {
            queryBuilder.andWhere(
                'audit.action = :action', {
                    action: query.action
                },
            );
        }

        if (query.entityType) {
            queryBuilder.andWhere(
                'audit.entity_type = :entityType', {
                    entityType: query.entityType,
                },
            );
        }

        const [items, total] = await queryBuilder.getManyAndCount();

        return {
            items, 
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
        }
    }
}
