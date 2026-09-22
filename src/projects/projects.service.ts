import { ForbiddenException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { PaginatedResultDto } from './dto/paginated-result.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { Organization } from '../organizations/entities/organization.entity.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectAuthorizationContext } from './interfaces/project-authorization-context.interface.js';
import { AuthorizationService } from '../auth/authorization/authorization.service.js';
import { Permission } from '../auth/enums/permissions.enum.js';
import { ProjectPolicy } from './policies/project.policy.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectCreatedEvent } from '../events/events/project-created.event.js';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,

        private readonly authorizationService: AuthorizationService,
        private readonly projectPolicy: ProjectPolicy,
        private readonly eventEmitter: EventEmitter2
    ){}

    private async getProjectForAuthorization(
        projectId: number
    ): Promise<Project> {
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
        return project;
    }

    async getAllProjects(
        paginationQueryDto: PaginationQueryDto
    ): Promise<PaginatedResultDto<Project>> {
        const { page, limit } = paginationQueryDto;

        const [data, total] = await this.projectRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,

        });
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        }
    }

    async getProjectById(
        userId: number,
        projectId: number,
    ): Promise<Project> {
        const project = await this.getProjectForAuthorization(
            projectId
        );

        await this.projectPolicy.can(
            userId,
            project,
            Permission.PROJECT_READ
        );

        return project;
    }

    async getProjectsByOrganizationId(
        organizationId: number,
        paginationQueryDto: PaginationQueryDto
    ): Promise<PaginatedResultDto<Project>> {
        const organization = await this.organizationRepository.findOneBy({
            id: organizationId
        });

        if (!organization) {
            throw new NotFoundException(`Organization with id ${organizationId} not found`);
        }
        const {page, limit} = paginationQueryDto;

        const [data, total] = await this.projectRepository.findAndCount({
            where: {
                organization: {
                    id: organizationId
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            order: {
                createdAt: 'DESC'
            },
        });
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async createProject(
        userId: number,
        organizationId: number,
        createProjectDto: CreateProjectDto
    ): Promise<Project> {
        const organization = await this.organizationRepository.findOneBy({
            id: organizationId
        });

        if (!organization) {
            throw new NotFoundException(`Organization with id ${organizationId} not found`);
        }
        const project = this.projectRepository.create({
            ...createProjectDto,
            organization
        });
        await this.projectRepository.save(project);

        this.eventEmitter.emit(
            'project.created',
            new ProjectCreatedEvent(
                project.id,
                organization.id,
                userId,
            ),
        );

        return project;



    }

    async deleteProject(
        userId: number,
        projectId: number
    ): Promise<void> {
        const project = await this.getProjectForAuthorization(
            projectId
        );

        await this.projectPolicy.can(
            userId,
            project,
            Permission.PROJECT_DELETE
        );
        
        await this.projectRepository.delete(projectId);
    }

    async updateProject(
        userId: number,
        projectId: number,
        updateProjectDto: UpdateProjectDto
    ): Promise<Project> {
        const project = await this.getProjectForAuthorization(
            projectId
        );

        await this.projectPolicy.can(
            userId,
            project,
            Permission.PROJECT_UPDATE
        );

        const { organizationId, ...projectFields } = updateProjectDto;
        Object.assign(project, projectFields);

        if (organizationId !== undefined) {
            const organization = await this.organizationRepository.findOneBy({
                id: organizationId,
            });

            if (!organization) {
                throw new NotFoundException(`Organization with id ${organizationId} not found`);
            }

            project.organization = organization;
        }

        return this.projectRepository.save(project);
    }

    async canUserAccessProject(
        userId: number,
        projectId: number
    ): Promise<number> {
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

        return project.organization.id;
    }

    async getProjectAuthorizationContext(
        projectId: number
    ): Promise<ProjectAuthorizationContext> {
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

        return {
            projectId: project.id,
            organizationId: project.organization.id
        };
    }

    
}

