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
import { OutboxModule } from '../infrastructure/outbox/outbox.module.js';
@Module({
  imports: [
      TypeOrmModule.forFeature([Task, Project, OrganizationMember, User]),
      OutboxModule
    ],
  controllers: [TasksController],
  providers: [TasksService, TaskPolicy, AuthorizationService],
  exports: [TasksService],
})
export class TasksModule {}
