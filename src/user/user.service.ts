import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { AuthService } from '../auth/auth.service.js';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly authService: AuthService,
    ){}

    private toResponse(user: User): UserResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            emailVerifiedAt: user.emailVerifiedAt,
        };
    }

    private assertSelf(
        requesterId: number,
        targetUserId: number
    ): void {
        if (requesterId !== targetUserId) {
            throw new ForbiddenException('You can only modify your own account');
        }
    }

    async getAllUsers() : Promise<UserResponseDto[]> {
        const users = await this.userRepository.find({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                emailVerifiedAt: true,
            },
        });

        return users.map((user) => this.toResponse(user));
    }

    async getUser(id: number) : Promise<UserResponseDto> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                emailVerifiedAt: true,
            },
        });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return this.toResponse(user);
    }

    async deleteUser(
        requesterId: number,
        id: number
    ): Promise<void> {
        this.assertSelf(requesterId, id);

        const existingUser = await this.userRepository.findOneBy({
            id: id
        });
        if (!existingUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        await this.userRepository.delete(id);
    }

    async updateUser(
        requesterId: number,
        id: number,
        updateUserDto: UpdateUserDto
    ): Promise<UserResponseDto> {
        this.assertSelf(requesterId, id);

        const existingUser = await this.userRepository.findOneBy({
            id: id
        })
        if (!existingUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }

        let emailChanged = false;

        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailExists = await this.userRepository.findOneBy({
                email: updateUserDto.email
            });
            if (emailExists) {
                throw new ConflictException(`User with email ${updateUserDto.email} already exists`);
            }
            existingUser.email = updateUserDto.email;
            existingUser.emailVerifiedAt = null;
            emailChanged = true;
        }
        if (updateUserDto.name) {
            existingUser.name = updateUserDto.name;
        }
        const savedUser = await this.userRepository.save(existingUser);

        if (emailChanged) {
            await this.authService.createEmailVerificationCode(savedUser);
        }

        return this.toResponse(savedUser);
    }
}
