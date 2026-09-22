import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    return this.userService.getUser(id);
  }

  @Post()
  createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Delete(':id')
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.userService.deleteUser(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }
}
