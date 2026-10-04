import { IsEnum, IsInt, IsNotEmpty } from "class-validator";
import { OrganizationRole } from "../enums/organization-role.enum.js";

export class AddMemberDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsEnum(OrganizationRole)
    @IsNotEmpty()
    role: OrganizationRole;
}