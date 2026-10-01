import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { TasksController } from './tasks.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { OrganizationMember } from '../organizations/entities/organization-member.entity.js';
import { User } from '../user/entities/user.entity.js';
import { TaskPolicy } from './policies/task.policy.js';
import { AuthorizationService } from '../auth/authorization/authorization.service.js';
import OutboxService from '../infrastructure/outbox/outbox.service.js';
import { OutboxEvent } from '../events/entities/outbox-event.entity.js';
@Module({
  imports: [
      TypeOrmModule.forFeature([Task, Project, OrganizationMember, User, OutboxEvent])
    ],
  controllers: [TasksController],
  providers: [TasksService, TaskPolicy, AuthorizationService, OutboxService],
  exports: [TasksService],
})
export class TasksModule {}
