import { Module } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { AuditController } from './audit.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity.js';
import { ProjectCreatedAuditListener } from './listeners/project-created-audit.listener.js';
import { ProjectUpdatedAuditListener } from './listeners/project-updated-audit.listener.js';
import { ProjectDeletedAuditListener } from './listeners/project-deleted-audit.listener.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditLog
    ]),
  ],
  controllers: [AuditController],
  providers: [AuditService, ProjectCreatedAuditListener, ProjectUpdatedAuditListener, ProjectDeletedAuditListener],
  exports: [AuditService],
})
export class AuditModule {}
