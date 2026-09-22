import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { ProjectsController } from './projects.controller.js';
import { Project } from './entities/project.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsService } from '../organizations/organizations.service.js';
import { Organization } from '../organizations/entities/organization.entity.js';
import { AuthorizationService } from '../auth/authorization/authorization.service.js';
import { ProjectAuthorizationService } from '../auth/authorization/project-authorization.service.js';
import { OrganizationMember } from '../organizations/entities/organization-member.entity.js';
import { ProjectPolicy } from './policies/project.policy.js';
import { AuthorizationGuard } from '../auth/guards/authorization.guard.js';
import { TasksModule } from '../tasks/tasks.module.js';
@Module({
  imports: [
      TypeOrmModule.forFeature([Project, Organization, OrganizationMember]),
      TasksModule,
    ],
  controllers: [ProjectsController],
  providers: [ProjectsService, OrganizationsService, AuthorizationService, ProjectAuthorizationService, ProjectPolicy, AuthorizationGuard],
})
export class ProjectsModule {}
