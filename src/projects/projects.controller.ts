import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { Project } from './entities/project.entity.js';
import { PaginatedResultDto } from './dto/paginated-result.dto.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { TasksService } from '../tasks/tasks.service.js';
import { Task } from '../tasks/entities/task.entity.js';
import { CreateTaskDto } from '../tasks/dto/create-task.dto.js';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}


  
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllProjects(
    @Query() paginationQueryDto: PaginationQueryDto,
    @CurrentUser() user: {userId: number}
  ): Promise<PaginatedResultDto<Project>> {
    return this.projectsService.getAllProjects(
      user.userId,
      paginationQueryDto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/tasks')
  getTasksByProjectId(
    @Param('id', ParseIntPipe) projectId: number,
    @Query() paginationQueryDto: PaginationQueryDto,
    @CurrentUser() user: {userId: number}
  ): Promise<PaginatedResultDto<Task>> {
    return this.tasksService.getTasksByProjectId(
      user.userId,
      projectId,
      paginationQueryDto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/tasks')
  createTask(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: {userId: number}
  ): Promise<Task> {
    return this.tasksService.createTask(
      user.userId,
      projectId,
      createTaskDto
    );
  }

  @UseGuards(
    JwtAuthGuard
  )
  @Get(':id')
  getProjectById(
    @Param('id', ParseIntPipe) projectId: number,
    
    @CurrentUser() user: {userId: number}
  ): Promise<Project> {
    return this.projectsService.getProjectById(
      user.userId,
      projectId
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

  @UseGuards(
    JwtAuthGuard
  )
  @Patch(':id')
  updateProjectById(
    @Param('id', ParseIntPipe) projectId: number,

    @CurrentUser() user: {userId: number},

    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    return this.projectsService.updateProject(
      user.userId,
      projectId,
      updateProjectDto
    );
  }
  
}
