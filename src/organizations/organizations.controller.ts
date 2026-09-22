import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { ProjectsService } from '../projects/projects.service.js';
import { Project } from '../projects/entities/project.entity.js';
import { CreateProjectDto } from '../projects/dto/create-project.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../user/entities/user.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AuthorizationGuard } from '../auth/guards/authorization.guard.js';
import { RequirePermission } from '../auth/decorators/require-permissions.decorator.js';
import { Permission } from '../auth/enums/permissions.enum.js';
import { AuditService } from '../audit/audit.service.js';
import { AuditLog } from '../audit/entities/audit-log.entity.js';
import { GetAuditLogsDto } from '../audit/dto/get-audit-logs.dto.js';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly projectsService: ProjectsService,
    private readonly auditService: AuditService
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
