import { OrganizationRole } from "../../organizations/enums/organization-role.enum.js";
import { Permission } from "../enums/permissions.enum.js";

export const ROLE_PERMISSIONS: Record<OrganizationRole, Permission[]> = {
    [OrganizationRole.OWNER] : [
        Permission.PROJECT_CREATE,
        Permission.PROJECT_DELETE,
        Permission.PROJECT_READ,
        Permission.PROJECT_UPDATE,

        Permission.TASK_CREATE,
        Permission.TASK_DELETE,
        Permission.TASK_READ,
        Permission.TASK_UPDATE,

        Permission.MEMBER_INVITE,
        Permission.MEMBER_READ,
        Permission.MEMBER_REMOVE,
        Permission.MEMBER_UPDATE_ROLE,

        Permission.ORGANIZATION_DELETE,
        Permission.ORGANIZATION_READ,
        Permission.ORGANIZATION_UPDATE,
    ],

    [OrganizationRole.ADMIN] : [
        Permission.PROJECT_CREATE,
        Permission.PROJECT_DELETE,
        Permission.PROJECT_READ,
        Permission.PROJECT_UPDATE,

        Permission.TASK_CREATE,
        Permission.TASK_DELETE,
        Permission.TASK_READ,
        Permission.TASK_UPDATE
    ],

    [OrganizationRole.MEMBER] : [
        Permission.PROJECT_READ,

        Permission.TASK_CREATE,
        Permission.TASK_READ,
        Permission.TASK_UPDATE
    ],
};