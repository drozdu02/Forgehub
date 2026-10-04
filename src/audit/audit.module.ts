import { Module } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { AuditController } from './audit.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity.js';
import { ProjectCreatedAuditListener } from './listeners/project/project-created-audit.listener.js';
import { ProjectUpdatedAuditListener } from './listeners/project/project-updated-audit.listener.js';
import { ProjectDeletedAuditListener } from './listeners/project/project-deleted-audit.listener.js';
import { TaskCreatedAuditListener } from './listeners/task/task-created-audit.listener.js';
import { TaskUpdatedAuditListener } from './listeners/task/task-updated-audit.listener.js';
import { TaskDeletedAuditListener } from './listeners/task/task-deleted-audit.listener.js';
import { TaskAssignedAuditListener } from './listeners/task/task-assigned-audit.listener.js';
import { TaskStatusChangedAuditListener } from './listeners/task/task-status-changed-audit.listener.js';
import { UserVerifiedAuditListener } from './listeners/user/user-verified-audit.listener.js';
import { UserLoggedInAuditListener } from './listeners/user/user-logged-in-audit.listener.js';
import { UserRegisteredAuditListener } from './listeners/user/user-registered-audit.listener.js';
import { OrganizationCreatedAuditListener } from './listeners/organization/organization-created-audit.listener.js';
import { MemberAddedAuditListener } from './listeners/organization/member-added-audit.listener.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditLog
    ]),
  ],
  controllers: [AuditController],
  providers: [
    AuditService, 
    ProjectCreatedAuditListener, 
    ProjectUpdatedAuditListener, 
    ProjectDeletedAuditListener,
    TaskCreatedAuditListener,
    TaskUpdatedAuditListener,
    TaskDeletedAuditListener,
    TaskAssignedAuditListener,
    TaskStatusChangedAuditListener,
    UserVerifiedAuditListener,
    UserLoggedInAuditListener,
    UserRegisteredAuditListener,
    OrganizationCreatedAuditListener,
    MemberAddedAuditListener
  ],
  exports: [AuditService],
})
export class AuditModule {}
