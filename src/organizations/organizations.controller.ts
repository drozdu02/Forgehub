import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { OrganizationsService } from './organizations.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { ProjectsService } from '../projects/projects.service.js';
import { Project } from '../projects/entities/project.entity.js';
import { CreateProjectDto } from '../projects/dto/create-project.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../user/entities/user.entity.js';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly projectsService: ProjectsService
  ) {}

  @Post(':userId')
  createOrganization(
    @Query('userId', ParseIntPipe) userId: number,
    @Body() createOrganizationDto: CreateOrganizationDto
  ) {
    return this.organizationsService.createOrganization(userId, createOrganizationDto);
  }

  @Post(':organizationId/projects')
    createProjectByOrganizationId(
      @Param('organizationId', ParseIntPipe) organizationId: number,
      @Body() createProjectDto: CreateProjectDto,
      @CurrentUser() user: { userId: number }
    ): Promise<Project> {
      return this.projectsService.createProject(
        user.userId,
        organizationId,
        createProjectDto
      );
    }

  
}
