import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
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
import { TaskChanges } from '../events/events/interfaces/task-changes.interface.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskUpdatedEvent } from '../events/events/task/task-updated.event.js';
import { TaskStatusChangedEvent } from '../events/events/task/task-status-changed.event.js';
import { TaskAssignedEvent } from '../events/events/task/task-assigned.event.js';
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

        private readonly taskPolicy: TaskPolicy,
        private readonly eventEmitter: EventEmitter2,
    ){}

    private async getUserOrganizationIds(
        userId: number
    ): Promise<number[]> {
        const memberships = await this.organizationMemberRepository.find({
            where: {
                user: {
                    id: userId
                },
            },
            relations: {
                organization: true
            },
        });

        return memberships.map((membership) => membership.organization.id);
    }

    private emptyPage(
        page: number,
        limit: number
    ): PaginatedResultDto<Task> {
        return {
            data: [],
            meta: {
                total: 0,
                page,
                limit,
                totalPages: 0
            }
        };
    }


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

    async getAllTasks(
        userId: number,
        paginationQueryDto: PaginationQueryDto
    ): Promise<PaginatedResultDto<Task>> {
        const page = paginationQueryDto.page ?? 1;
        const limit = paginationQueryDto.limit ?? 10;
        const organizationIds = await this.getUserOrganizationIds(userId);

        if (organizationIds.length === 0) {
            return this.emptyPage(page, limit);
        }

        const [data, total] = await this.taskRespository.findAndCount({
            where: {
                project: {
                    organization: {
                        id: In(organizationIds)
                    }
                }
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
        userId: number,
        projectId: number,
        paginationQueryDto: PaginationQueryDto
    ): Promise<PaginatedResultDto<Task>> {
        const project = await this.projectRepository.findOne({
            where: {
                id: projectId
            },
            relations: {
                organization: true
            },
        });

        if (!project) {
            throw new NotFoundException(`Project with id ${projectId} not found`);
        }

        await this.taskPolicy.canOnProject(
            userId,
            project,
            Permission.TASK_READ
        );

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
        userId: number,
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

        await this.taskPolicy.canOnProject(
            userId,
            project,
            Permission.TASK_CREATE
        );

        let assignee: User | null = null;

        if (createTaskDto.assigneeId !== undefined) {
            assignee = await this.userRepository.findOneBy({
                id: createTaskDto.assigneeId,
            });

            if (!assignee) {
                throw new NotFoundException(`User with id ${createTaskDto.assigneeId} not found`);
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
            Permission.TASK_DELETE
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

        const oldStatus = task.taskStatus;
        const oldAssigneeId = task.assignee?.id ?? null;
        const oldDeadline = task.deadline;
        const changes : TaskChanges = {};

        if (updateTaskDto.name !== undefined && updateTaskDto.name !== task.name) {
            changes.name = {
                oldValue: task.name,
                newValue: updateTaskDto.name
            };
            task.name = updateTaskDto.name;
        }

        if (updateTaskDto.description !== undefined && updateTaskDto.description !== task.description) {
            changes.description = {
                oldValue: task.description,
                newValue: updateTaskDto.description
            };
            task.description = updateTaskDto.description;
        }

        if (updateTaskDto.taskPriority !== undefined && updateTaskDto.taskPriority !== task.taskPriority) {
            changes.priority = {
                oldValue: task.taskPriority,
                newValue: updateTaskDto.taskPriority
            };
            task.taskPriority = updateTaskDto.taskPriority;
        }

        if (updateTaskDto.deadline !== undefined) {
            const newDeadline = updateTaskDto.deadline === null
                ? null
                : new Date(updateTaskDto.deadline);

            const sameDeadline =
                (oldDeadline === null && newDeadline === null) ||
                (oldDeadline !== null &&
                    newDeadline !== null &&
                    oldDeadline.getTime() === newDeadline.getTime());

            if (!sameDeadline) {
                changes.deadline = {
                    oldValue: oldDeadline,
                    newValue: newDeadline
                };
                task.deadline = newDeadline;
            }
        }

        let statusChanged = false;
        const newStatus = updateTaskDto.taskStatus;
        if (newStatus !== undefined && newStatus !== oldStatus) {
            task.taskStatus = newStatus;
            statusChanged = true;
        }

        let assigneeChanged = false;
        let newAssigneeId: number | null = oldAssigneeId;

        if (updateTaskDto.assigneeId !== undefined && updateTaskDto.assigneeId !== oldAssigneeId) {
            let newAssignee: User | null = null;

            if (updateTaskDto.assigneeId !== null) {
                newAssignee = await this.userRepository.findOne({
                    where: {
                        id: updateTaskDto.assigneeId
                    },
                });

                if (!newAssignee) {
                    throw new NotFoundException(`User with id ${updateTaskDto.assigneeId} not found`);
                }

                const membership = await this.organizationMemberRepository.findOne({
                    where: {
                        user: {
                            id: newAssignee.id
                        },
                        organization: {
                            id: task.project.organization.id
                        },
                    },
                });

                if (!membership) {
                    throw new BadRequestException('Assignee must belong to the project');
                }
            }

            task.assignee = newAssignee;
            newAssigneeId = newAssignee?.id ?? null;
            assigneeChanged = true;
        }

        const hasChanges = Object.keys(changes).length > 0 || statusChanged || assigneeChanged;

        if (!hasChanges) {
            return task;
        }

        const updatedTask = await this.taskRespository.save(task);

        const occuredAt = new Date();

        if (Object.keys(changes).length > 0) {
            this.eventEmitter.emit(
                'task.updated',
                new TaskUpdatedEvent(
                    updatedTask.id,
                    updatedTask.project.id,
                    updatedTask.project.organization.id,
                    userId,
                    changes,
                    occuredAt
                ),
            );
        }

        if (statusChanged) {
            this.eventEmitter.emit(
                'task.status-changed',
                new TaskStatusChangedEvent(
                    updatedTask.id,
                    updatedTask.project.id,
                    task.project.organization.id,
                    userId,
                    oldStatus,
                    updatedTask.taskStatus,
                    occuredAt
                ),
            );
        }

        if (assigneeChanged) {
            this.eventEmitter.emit(
                'task.assignee-changed',
                new TaskAssignedEvent(
                    updatedTask.id,
                    updatedTask.project.id,
                    task.project.organization.id,
                    userId,
                    oldAssigneeId,
                    newAssigneeId,
                    occuredAt,
                ),
            );
        }

        return updatedTask;

    }

    
}
