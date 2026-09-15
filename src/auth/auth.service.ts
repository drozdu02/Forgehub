import { ConflictException, Injectable, NotFoundException,  UnauthorizedException } from '@nestjs/common';
import { PasswordService } from './password.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity.js';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto.js';
import { RegisterResponseDto } from './dto/register-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { createHash, randomBytes } from 'crypto';
import { Session } from './entities/session.entity.js';
import { RefreshResultDto } from './dto/refresh-result.dto.js';

@Injectable()
export class AuthService {
    constructor(

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>,
        private readonly passwordService: PasswordService,
        private readonly jwtService: JwtService
    ) {}

    private generateRefreshToken(): string {
        return randomBytes(64).toString('hex');
    }

    private hashRefreshToken(refreshToken: string): string {
        return createHash('sha-256')
            .update(refreshToken)
            .digest('hex');
    }

    private async generateAccessToken(
        userId: number
    ): Promise<string> {
        const payload: JwtPayload = {
            sub: userId
        };
        return this.jwtService.signAsync(payload);
    }


    async register(
        registerDto: RegisterDto
    ): Promise<RegisterResponseDto> {
        const existingUser = await this.userRepository.findOneBy({
            email: registerDto.email
        });

        if (existingUser) {
            throw new ConflictException(`User with email ${registerDto.email} already exists`);
        }

        const passwordHash = await this.passwordService.hash(
            registerDto.password
        );

        const user = this.userRepository.create({
            name: registerDto.name,
            email: registerDto.email,
            passwordHash: passwordHash
        });
        await this.userRepository.save(user);

        return {
            id: user.id,
            name: user.name,
            email: user.email
        }

    }

    async login(
        loginDto: LoginDto
    ): Promise<LoginResponseDto> {
        const user = await this.userRepository.findOneBy({
            email: loginDto.email
        });

        if (!user) {
            throw new UnauthorizedException(`Invalid email or password`);
        }

        const verified = await this.passwordService.verify(
            user.passwordHash,
            loginDto.password
        );

        if (!verified) {
            throw new UnauthorizedException(`Invalid email or password`);
        }

        

        const refreshToken = this.generateRefreshToken();
        const refreshTokenHash = this.hashRefreshToken(refreshToken);

        const accessToken = await this.generateAccessToken(user.id);

        const session = await this.sessionRepository.create({
            user,
            refreshTokenHash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        });

        await this.sessionRepository.save(session);

        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        };
    }

    async refresh(
        refreshToken: string
    ): Promise<RefreshResultDto> {

        const refreshTokenHash = this.hashRefreshToken(refreshToken)

        const session = await this.sessionRepository.findOne({
            where: {
                refreshTokenHash,
            },
            relations: {
                user: true
            },

        });

        if (!session) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (session.revokedAt === null) {
            throw new UnauthorizedException('Refresh token revoked');
        }

        if (session.expiresAt <= new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }

        const accessToken = await this.jwtService.signAsync({
            sub: session.user.id
        });

        const newRefreshToken = this.generateRefreshToken();
        session.refreshTokenHash = this.hashRefreshToken(newRefreshToken);

        await this.sessionRepository.save(session);

        return {
            accessToken,
            refreshToken
        }
    }

    async logout(
        refreshToken: string
    ): Promise<void> {

        const refreshTokenHash = this.hashRefreshToken(refreshToken);

        const session = await this.sessionRepository.findOne({
            where: {
                refreshTokenHash: refreshTokenHash
            },
        });

        if (!session) {
            return;
        }
        session.revokedAt = new Date();
        await this.sessionRepository.save(session);
    }
}
