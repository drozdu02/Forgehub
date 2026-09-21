import { SetMetadata } from "@nestjs/common";
import { Permission } from "../enums/permissions.enum.js";
import { PERMISSION_KEY } from "../constants/permission-key.constant.js";

export const RequirePermission = (
    permission: Permission,
) => SetMetadata(PERMISSION_KEY, permission);