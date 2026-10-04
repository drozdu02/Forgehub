import { IsNotEmpty, IsNumber } from "class-validator";

export class ProjectAuthorizationContext {
    @IsNumber()
    @IsNotEmpty()
    projectId: number;

    @IsNumber()
    @IsNotEmpty()
    organizationId: number;
}