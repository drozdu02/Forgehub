import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { Project } from './entities/project.entity.js';
import { PaginatedResultDto } from './dto/paginated-result.dto.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AuthorizationGuard } from '../auth/guards/authorization.guard.js';
import { RequirePermission } from '../auth/decorators/require-permissions.decorator.js';
import { Permission } from '../auth/enums/permissions.enum.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}


  
  @Get()
  getAllProjects(
    @Query() paginationQueryDto: PaginationQueryDto
  ): Promise<PaginatedResultDto<Project>> {
    return this.projectsService.getAllProjects(
      paginationQueryDto
    );
  }

  
  @Get(':id')
  getProjectById(
    @Query('id', ParseIntPipe) projectId: number
  ): Promise<Project> {
    return this.projectsService.getProjectById(projectId);
  }

  @UseGuards(
    JwtAuthGuard,
    AuthorizationGuard
  )
  @RequirePermission(Permission.PROJECT_READ)
  @Get(":organizationId/projects")
  getProjectsByOrganizationId(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Query() paginationQueryDto: PaginationQueryDto
  ): Promise<PaginatedResultDto<Project>> {
    return this.projectsService.getProjectsByOrganizationId(
      organizationId,
      paginationQueryDto
    );
  }

  @UseGuards(
    JwtAuthGuard,
  )
  @Delete(':id')
  deleteProjectById(
    @Param('id', ParseIntPipe) projectId: number,
    @CurrentUser() user: {userId: number}
  ): Promise<void> {
    return this.projectsService.deleteProject(user.userId, projectId);
  }

  @Patch(':id')
  updateProjectById(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    return this.projectsService.updateProject(
      projectId,
      updateProjectDto
    );
  }
  
}
