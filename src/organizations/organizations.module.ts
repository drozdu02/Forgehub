import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller.js';
import { OrganizationsService } from './organizations.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity.js';
import { OrganizationMember } from './entities/organization-member.entity.js';
import { ProjectsService } from '../projects/projects.service.js';
import { Project } from '../projects/entities/project.entity.js';
import { AuthorizationService } from '../auth/authorization/authorization.service.js';
import { ProjectPolicy } from '../projects/policies/project.policy.js';
import { AuthorizationGuard } from '../auth/guards/authorization.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, OrganizationMember, Project])
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, ProjectsService, AuthorizationService, ProjectPolicy, AuthorizationGuard],
  exports: [OrganizationsService]
})
export class OrganizationsModule {}
