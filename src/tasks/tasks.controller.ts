import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { Task } from './entities/task.entity.js';
import { PaginatedResultDto } from './dto/paginated-result.dto.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getAllTasks(
    @Query() paginationQueryDto: PaginationQueryDto
  ): Promise<PaginatedResultDto<Task>> {
    return this.tasksService.getAllTasks(paginationQueryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getTaskById(
    @Param(':id', ParseIntPipe) taskId: number,

    @CurrentUser() user: {userId: number}
  ) {
    return this.tasksService.getTaskById(
      user.userId,
      taskId
    );
  }

  @Get('projects/:projectId/tasks')
  getTasksByProjectId(
    @Param(':projectId', ParseIntPipe) projectId: number,

    @Query() paginationQueryDto: PaginationQueryDto
  ): Promise<PaginatedResultDto<Task>> {
    return this.tasksService.getTasksByProjectId(
      projectId,
      paginationQueryDto
    );
  }

  
  @Post(':id')
  createTask(
    @Param(':id', ParseIntPipe) projectId: number,
    @Body() createTaskDto: CreateTaskDto
  ): Promise<Task> {
    return this.tasksService.createTask(
      projectId,
      createTaskDto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateTask(
    @Param(':id', ParseIntPipe) taskId: number,

    @Body() updateTaskDto: UpdateTaskDto,

    @CurrentUser() user: {userId: number},
  ):Promise<Task> {
    return this.tasksService.updateTaskById(
      user.userId,
      taskId,
      updateTaskDto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteTask(
    @Param(':id', ParseIntPipe) taskId: number,

    @CurrentUser() user: {userId: number},
  ): Promise<void> {
    return this.tasksService.deleteTaskById(
      user.userId,
      taskId
    );
  }


    
}
