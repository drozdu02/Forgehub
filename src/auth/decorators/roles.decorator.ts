import { SetMetadata } from "@nestjs/common";
import { OrganizationRole } from "../../organizations/enums/organization-role.enum.js";
import { ROLE_KEY } from "../constants/role-key.constant.js";


export const ROLES = (
    ...roles: OrganizationRole[]
) => SetMetadata(ROLE_KEY, roles);