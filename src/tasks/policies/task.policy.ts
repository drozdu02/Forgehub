import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthorizationService } from "../../auth/authorization/authorization.service.js";
import { Task } from "../entities/task.entity.js";
import { Permission } from "../../auth/enums/permissions.enum.js";

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
        const hasPermission = await this.authorizationService.hasPermission(
            userId,
            task.project.organization.id,
            permission
        );

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to perform this action');
        }
    }

}