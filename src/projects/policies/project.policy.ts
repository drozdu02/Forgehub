import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthorizationService } from "../../auth/authorization/authorization.service.js";
import { Permission } from "../../auth/enums/permissions.enum.js";
import { Project } from "../entities/project.entity.js";

@Injectable()
export class ProjectPolicy {
    constructor(
        private readonly authorizationService: AuthorizationService,
    ){}


    async can(
        userId: number,
        project: Project,
        permission: Permission
    ): Promise<void> {

        const hasPermission = await this.authorizationService.hasPermission(
            userId,
            project.id,
            permission
        );

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to perform this action');
        }
    }
}