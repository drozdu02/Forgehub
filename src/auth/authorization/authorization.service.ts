import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrganizationMember } from "../../organizations/entities/organization-member.entity.js";
import { Repository } from "typeorm";
import { Project } from "../../projects/entities/project.entity.js";
import { Permission } from "../enums/permissions.enum.js";
import { ROLE_PERMISSIONS } from "../constants/role-permissions.constant.js";
import { ProjectsService } from "../../projects/projects.service.js";

@Injectable()
export class AuthorizationService {
    constructor(
        @InjectRepository(OrganizationMember)
        private readonly membershipRepository: Repository<OrganizationMember>,

        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,


    ) {}

    async hasPermission(
        userId: number,
        organizationId: number,
        permission: Permission
    ): Promise<boolean>{

        const membership = await this.membershipRepository.findOne({
            where: {
                user: {
                    id: userId
                },
                organization: {
                    id: organizationId
                },
            },
        });

        if (!membership) {
            return false;
        }

        const permissions = ROLE_PERMISSIONS[membership.role];

        return permissions.includes(permission);
    }

    
}