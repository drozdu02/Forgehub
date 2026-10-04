import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
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
import { ChangeMemberRoleDto } from './dto/change-member-role.dto.js';
import { OrganizationMember } from './entities/organization-member.entity.js';
import { AddMemberDto } from './dto/add-member.dto.js';

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

  @UseGuards(
    JwtAuthGuard,
    AuthorizationGuard
  )
  @RequirePermission(Permission.MEMBER_UPDATE_ROLE)
  @Patch(':organizationId/members/:memberUserId/role')
  changeMemberRole(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('memberUserId', ParseIntPipe) memberUserId: number,
    @Body() changeMemberRoleDto: ChangeMemberRoleDto,
    @CurrentUser() user: { userId: number }
  ): Promise<OrganizationMember> {
    return this.organizationsService.changeMemberRole(
      user.userId,
      organizationId,
      memberUserId,
      changeMemberRoleDto.role
    );
  }

  @UseGuards(
    JwtAuthGuard,
    AuthorizationGuard
  )
  @RequirePermission(Permission.MEMBER_INVITE)
  @Post(':organizationId/members')
  addMember(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: { userId: number }
  ): Promise<OrganizationMember> {
    return this.organizationsService.addMember(
      user.userId,
      organizationId,
      addMemberDto.userId,
      addMemberDto.role
    )
  }

  @UseGuards(
    JwtAuthGuard,
    AuthorizationGuard
  )
  @RequirePermission(Permission.MEMBER_REMOVE)
  @Delete(':organizationId/members/:memberUserId')
  removeMember(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Param('memberUserId', ParseIntPipe) memberUserId: number,
    @CurrentUser() user: { userId: number }
  ): Promise<void> {
    return this.organizationsService.removeMember(
      user.userId, 
      organizationId, 
      memberUserId
    );
  }
}
