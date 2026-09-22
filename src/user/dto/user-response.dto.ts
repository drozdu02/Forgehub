export class UserResponseDto {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    emailVerifiedAt: Date | null;
}
