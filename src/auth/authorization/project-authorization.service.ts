import { ForbiddenException, Injectable } from "@nestjs/common";
import { ProjectsService } from "../../projects/projects.service.js";
import { AuthorizationService } from "./authorization.service.js";
import { Permission } from "../enums/permissions.enum.js";

@Injectable()
export class ProjectAuthorizationService {
    constructor(
        private readonly projectService: ProjectsService,
        private readonly authorizationService: AuthorizationService,
    ){}

    async authorizeProject(
        userId: number,
        projectId: number,
        permission: Permission
    ): Promise<void> {
        const { organizationId } = await this.projectService.getProjectAuthorizationContext(
            projectId,
        );

        const hasPermission = await this.authorizationService.hasPermission(
            userId,
            organizationId,
            permission
        );

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to perform this action');
        }

        
    }
}