import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { ProjectsService } from '../projects/projects.service.js';
import { Project } from '../projects/entities/project.entity.js';
import { CreateProjectDto } from '../projects/dto/create-project.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AuthorizationGuard } from '../auth/guards/authorization.guard.js';
import { RequirePermission } from '../auth/decorators/require-permissions.decorator.js';
import { Permission } from '../auth/enums/permissions.enum.js';
import { AuditService } from '../audit/audit.service.js';
import { GetAuditLogsDto } from '../audit/dto/get-audit-logs.dto.js';
import { PaginatedResultDto } from '../projects/dto/paginated-result.dto.js';
import { PaginationQueryDto } from '../projects/dto/pagination-query.dto.js';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly projectsService: ProjectsService,
    private readonly auditService: AuditService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrganization(
    @CurrentUser() user: { userId: number },
    @Body() createOrganizationDto: CreateOrganizationDto
  ) {
    return this.organizationsService.createOrganization(
      user.userId,
      createOrganizationDto
    );
  }

  @UseGuards(
    JwtAuthGuard,
    AuthorizationGuard
  )
  @RequirePermission(Permission.PROJECT_CREATE)
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

  @UseGuards(
    JwtAuthGuard,
    AuthorizationGuard
  )
  @RequirePermission(Permission.PROJECT_READ)
  @Get(':organizationId/projects')
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
    AuthorizationGuard
  )
  @RequirePermission(
    Permission.PROJECT_READ
  )
  @Get(':organizationId/audit-logs')
  getAuditLogs(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Query() query: GetAuditLogsDto
  ) {
    return this.auditService.getForOrganization(
      organizationId,
      query
    );
  }
}
