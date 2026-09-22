import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    async getAllUsers() : Promise<User[]> {
        return this.userRepository.find();
    }

    async getUser(id: number) : Promise<User> {
        const user = await this.userRepository.findOneBy({
            id: id
        });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }

    async deleteUser(id: number) : Promise<void> {
        const existingUser = await this.userRepository.findOneBy({
            id: id
        });
        if (!existingUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        await this.userRepository.delete(id);
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto) : Promise<User> {
        const existingUser = await this.userRepository.findOneBy({
            id: id
        })
        if (!existingUser) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const emailExists = await this.userRepository.findOneBy({
                email: updateUserDto.email
            });
            if (emailExists) {
                throw new ConflictException(`User with email ${updateUserDto.email} already exists`);
            }
            existingUser.email = updateUserDto.email;
        }
        if (updateUserDto.name) {
            existingUser.name = updateUserDto.name;
        }
        return await this.userRepository.save(existingUser);
    }
}
