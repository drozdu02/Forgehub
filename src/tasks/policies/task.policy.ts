import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthorizationService } from "../../auth/authorization/authorization.service.js";
import { Task } from "../entities/task.entity.js";
import { Permission } from "../../auth/enums/permissions.enum.js";
import { Project } from "../../projects/entities/project.entity.js";

@Injectable()
export class TaskPolicy {
    constructor(
        private readonly authorizationService: AuthorizationService
    ){}

    async can(
        userId: number,
        task: Task,
        permission: Permission
    ): Promise<void> {
        await this.assertPermission(
            userId,
            task.project.organization.id,
            permission
        );
    }

    async canOnProject(
        userId: number,
        project: Project,
        permission: Permission
    ): Promise<void> {
        await this.assertPermission(
            userId,
            project.organization.id,
            permission
        );
    }

    private async assertPermission(
        userId: number,
        organizationId: number,
        permission: Permission
    ): Promise<void> {
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
