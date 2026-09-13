import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { PaginatedResultDto } from './dto/paginated-result.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { Organization } from '../organizations/entities/organization.entity.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>
    ){}

    @UseGuards(JwtAuthGuard)
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

    @UseGuards(JwtAuthGuard)
    async getProjectById(
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
            throw new NotFoundException(`Project with id ${projectId} not found`)
        }

        return project;
    }

    @UseGuards(JwtAuthGuard)
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

    @UseGuards(JwtAuthGuard)
    async createProject(
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
        return this.projectRepository.save(project);
    }

    @UseGuards(JwtAuthGuard)
    async deleteProject(
        projectId: number
    ): Promise<void> {
        const result = await this.projectRepository.delete(projectId);

        if (result.affected === 0) {
            throw new NotFoundException(`Project with id ${projectId} not found`);
        }
    }

    @UseGuards(JwtAuthGuard)
    async updateProject(
        projectId: number,
        updateProjectDto: UpdateProjectDto
    ): Promise<Project> {
        const project = await this.projectRepository.preload({
            id: projectId,
            ...updateProjectDto,
        });

        if (!project) {
            throw new NotFoundException(`Project with id ${projectId} not found`);
        }
        return this.projectRepository.save(project);
    }

    
}

