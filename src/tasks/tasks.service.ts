import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { Task } from './entities/task.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { PaginatedResultDto } from './dto/paginated-result.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../projects/entities/project.entity.js';
import { User } from '../user/entities/user.entity.js';
import { OrganizationMember } from '../organizations/entities/organization-member.entity.js';
import { TaskPolicy } from './policies/task.policy.js';
import { Permission } from '../auth/enums/permissions.enum.js';
@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRespository: Repository<Task>,

        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(OrganizationMember)
        private readonly organizationMemberRepository: Repository<OrganizationMember>,

        private readonly taskPolicy: TaskPolicy
    ){}


    private async getTaskForAuthorization(
        taskId: number
    ): Promise<Task> {
        const task = await this.taskRespository.findOne({
            where: {
                id: taskId
            },
            relations: {
                project: {
                    organization: true
                },
                assignee: true
            },
        });

        if (!task) {
            throw new NotFoundException(`Task with id ${taskId} not found`);
        }

        return task;
    }

    async getAllTasks(paginationQueryDto: PaginationQueryDto): Promise<PaginatedResultDto<Task>> {
        const page = paginationQueryDto.page ?? 1;
        const limit = paginationQueryDto.limit ?? 10;

        const [data, total] = await this.taskRespository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: {
                createdAt: 'ASC'
            },
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getTaskById(
        userId: number,
        taskId: number
    ): Promise<Task> {
        const task = await this.getTaskForAuthorization(
            taskId
        );

        await this.taskPolicy.can(
            userId,
            task,
            Permission.TASK_READ
        );

        return task;
    }

    async getTasksByProjectId(
        projectId: number,
        paginationQueryDto: PaginationQueryDto
    ): Promise<PaginatedResultDto<Task>> {

        const project = await this.projectRepository.findOneBy({
            id: projectId
        });

        if (!project) {
            throw new NotFoundException(`Project with id ${projectId} not found`);
        }

        const page = paginationQueryDto.page ?? 1;
        const limit = paginationQueryDto.limit ?? 10;

        const [data, total] = await this.taskRespository.findAndCount({
            where: {
                project: {
                    id: projectId
                },
            },
            relations: {
                assignee: true
            },
            skip: (page - 1) * limit,
            take: limit,
            order: {
                createdAt: 'ASC'
            },
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async createTask(
        projectId: number,
        createTaskDto: CreateTaskDto
    ): Promise<Task> {

        const project = await this.projectRepository.findOne({
            where: {
                id: projectId,
            },
            relations: {
                organization: true
            },
        });

        if (!project) {
            throw new NotFoundException(`Project with id ${projectId} not found`);
        }

        let assignee : User | null = null;

        if (createTaskDto.assigneeId !== undefined) {
            assignee = await this.userRepository.findOneBy({
                id: createTaskDto.assigneeId,
            });
        }

        if (!assignee) {
            throw new NotFoundException(`User with id ${createTaskDto.assigneeId} not found`)
        }

        const membership = await this.organizationMemberRepository.findOne({
            where: {
                user: {
                    id: assignee.id
                },
                organization: {
                    id: project.organization.id
                },
            },
        });

        if (!membership) {
            throw new ForbiddenException(`User with id ${createTaskDto.assigneeId} is not a member of this organization`);
        }


        const task = this.taskRespository.create({
            name: createTaskDto.name,
            description: createTaskDto.description,
            taskPriority: createTaskDto.taskPriority,
            deadline: createTaskDto.deadline ? new Date(createTaskDto.deadline) : null,
            project: project,
            assignee: assignee
        });
        return this.taskRespository.save(task);
    }

    async deleteTaskById(
        userId: number,
        taskId: number,
    ): Promise<void> {
        const task = await this.getTaskForAuthorization(
            taskId
        );

        await this.taskPolicy.can(
            userId,
            task,
            Permission.TASK_READ
        );

        await this.taskRespository.delete({
            id: taskId
        });

    }

    async updateTaskById(
        userId: number,
        taskId: number,
        updateTaskDto: UpdateTaskDto
    ): Promise<Task> {
        const task = await this.getTaskForAuthorization(
            taskId
        );

        await this.taskPolicy.can(
            userId,
            task,
            Permission.TASK_UPDATE
        );

        if (updateTaskDto.assigneeId !== undefined) {
            if (updateTaskDto.assigneeId === null) {
                task.assignee = null;
            } else {
                const assignee = await this.userRepository.findOneBy({
                    id: updateTaskDto.assigneeId
                });

                if (!assignee) {
                    throw new NotFoundException(`User with id ${updateTaskDto.assigneeId} not found`);
                }

                const membership = await this.organizationMemberRepository.findOne({
                    where: {
                        user: {
                            id: assignee.id
                        },
                        organization: {
                            id: task.project.organization.id,
                        },
                    },
                });
                
                if (!membership) {
                    throw new NotFoundException(`User with id ${assignee.id} is not a member of this organization`);
                }
                task.assignee = assignee;
            }
        }

        if (updateTaskDto.name !== undefined) {
            task.name = updateTaskDto.name;
        }

        if (updateTaskDto.description !== undefined) {
            task.description = updateTaskDto.description;
        }

        if (updateTaskDto.taskPriority !== undefined) {
            task.description = updateTaskDto.taskPriority;
        }

        if (updateTaskDto.deadline !== undefined) {
            task.deadline = updateTaskDto.deadline ? new Date(updateTaskDto.deadline) : null;
        }
        return this.taskRespository.save(task);
    }

    
}
