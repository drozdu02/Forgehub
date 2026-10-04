import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "../enums/permissions.enum.js";
import { AuthorizationService } from "../authorization/authorization.service.js";
import { PERMISSION_KEY } from "../constants/permission-key.constant.js";

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authorizationService: AuthorizationService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const permission = this.reflector.get<Permission>(
            PERMISSION_KEY,
            context.getHandler()
        );

        if (!permission) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        
        const user = request.user;

        if (!user) { 
            throw new UnauthorizedException();
        }

        const organizationId = Number(request.params.organizationId);

        if (!Number.isInteger(organizationId)) {
            throw new BadRequestException('Invalid organization');
        }

        const hasPermission = await this.authorizationService.hasPermission(
            user.userId,
            organizationId,
            permission
        );

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to perform this action');
        }

        return true;
    }
}
