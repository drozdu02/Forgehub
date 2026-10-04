import { IsEnum, IsNotEmpty } from "class-validator";
import { OrganizationRole } from "../enums/organization-role.enum.js";

export class ChangeMemberRoleDto {
    @IsEnum(OrganizationRole)
    @IsNotEmpty()
    role: OrganizationRole;
}