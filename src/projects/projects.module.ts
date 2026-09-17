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
@Module({
  imports: [
      TypeOrmModule.forFeature([Project, Organization, OrganizationMember]),
    ],
  controllers: [ProjectsController],
  providers: [ProjectsService, OrganizationsService, AuthorizationService, ProjectAuthorizationService],
})
export class ProjectsModule {}
