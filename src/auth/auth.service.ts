import { ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable,  NotFoundException,  UnauthorizedException } from '@nestjs/common';
import { PasswordService } from './password.service.js';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity.js';
import { DataSource, IsNull, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto.js';
import { RegisterResponseDto } from './dto/register-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { createHash, randomBytes, randomInt, randomUUID } from 'crypto';
import { Session } from './entities/session.entity.js';
import { RefreshResultDto } from './dto/refresh-result.dto.js';
import { Project } from '../projects/entities/project.entity.js';
import { EmailVerificationCode } from './entities/email-verification-code.entity.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { RedisService } from '../redis/redis.service.js';
import { MailService } from '../mail/mail.service.js';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
    constructor(

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>,
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(EmailVerificationCode)
        private readonly emailVerificationCodeRepository: Repository<EmailVerificationCode>,
        
        @InjectDataSource()
        private readonly dataSource: DataSource,

        private readonly passwordService: PasswordService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly mailService: MailService,
        private readonly eventEmmiter: EventEmitter2,
    ) {}

    private generateRefreshToken(): string {
        return randomBytes(64).toString('hex');
    }

    private hashRefreshToken(refreshToken: string): string {
        return createHash('sha256')
            .update(refreshToken)
            .digest('hex');
    }

    private generateOtp(): string {
        return randomInt(100000, 1000000)
        .toString();
    }

    private async generateAccessToken(
        userId: number
    ): Promise<string> {
        const payload: JwtPayload = {
            sub: userId
        };
        return this.jwtService.signAsync(payload);
    }

    async createEmailVerificationCode(
        user: User
    ): Promise<void> {
        const code = this.generateOtp();

        const codeHash = await this.passwordService.hash(
            code
        );

        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        const verificationCode = await this.emailVerificationCodeRepository.create({
            user,
            codeHash,
            expiresAt,
            usedAt: null
        });

        await this.emailVerificationCodeRepository.save(verificationCode);
        
        await this.mailService.enqueueVerificationEmail(
            user.id,
            user.email,
            code
        );

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

        await this.createEmailVerificationCode(user);

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

        if (!user.emailVerifiedAt) {
            throw new ForbiddenException('Email is not verified');
        }

        const refreshToken = this.generateRefreshToken();
        const refreshTokenHash = this.hashRefreshToken(refreshToken);

        const accessToken = await this.generateAccessToken(user.id);

        const session = await this.sessionRepository.create({
            familyId: randomUUID(),
            user,
            refreshTokenHash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            revokedAt: null,
            lastUsedAt: null,
            replacedBySessionId: null
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
        const refreshTokenHash = this.hashRefreshToken(
            refreshToken
        );
        return this.dataSource.transaction(
            async (manager) => {
                const session = await manager.findOne(Session, {
                    where: {
                        refreshTokenHash: refreshTokenHash
                    },
                    relations: {
                        user: true
                    },
                    lock: {
                        mode: 'pessimistic_write', tables: ['sessions']
                    },
                });

                if (!session) {
                    throw new UnauthorizedException('Invalid refresh token');
                }

                if (session.replacedBySessionId) {
                    await manager
                        .createQueryBuilder()
                        .update(Session)
                        .set({
                            revokedAt: new Date(),
                        })
                        .where('family_id = :familyId', {
                            familyId: session.familyId,
                        })
                        .andWhere('revoked_at IS NULL')
                        .execute();
                    throw new UnauthorizedException('Invalid refresh token');
                }

                if (session.revokedAt) {
                    throw new UnauthorizedException('Invalid refresh token');
                }

                if (session.expiresAt <= new Date()) {
                    throw new UnauthorizedException('Invalid refresh token');
                }

                const newRefreshToken = this.generateRefreshToken();
                const newRefreshTokenHash = this.hashRefreshToken(newRefreshToken);

                const newSession = manager.create(Session, {
                    familyId: session.familyId,
                    user: session.user,
                    refreshTokenHash: newRefreshTokenHash,
                    expiresAt: session.expiresAt,
                    revokedAt: null,
                    lastUsedAt: null,
                    replacedBySessionId: null,
                });


                await manager.save(Session, newSession);

                session.revokedAt = new Date();
                session.lastUsedAt = new Date();
                session.replacedBySessionId = newSession.id;

                await manager.save(Session, session);

                const accessToken = await this.generateAccessToken(
                    session.user.id
                );

                return {
                    accessToken: accessToken,
                    refreshToken: newRefreshToken
                };
            },
        );
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

    async logoutAll(
        userId: number
    ): Promise<void> {
        await this.sessionRepository
            .createQueryBuilder()
            .update(Session)
            .set({
                revokedAt: new Date()
            })
            .where('user_id = :userId', {
                userId,
            })
            .andWhere('revoked_at IS NULL')
            .execute();
    }

    async verifyEmail(
        verifyEmailDto: VerifyEmailDto
    ): Promise<void> {
        return this.dataSource.transaction(
            async manager => {
                const user = await manager.findOne(User, {
                    where: {
                        email: verifyEmailDto.email
                    },
                });

                if (!user) {
                    throw new NotFoundException(`User with email ${verifyEmailDto.email} not found`);
                }

                const attemptsKey = `otp:attempts:user:${user.id}`;

                const attempts = await this.redisService.incrementWithTtl(
                    attemptsKey,
                    10 * 60
                );

                if (attempts > 5) {
                    throw new HttpException(
                        'Too many requests',
                        HttpStatus.TOO_MANY_REQUESTS
                    );
                }

                const verificationCode = await manager.findOne(EmailVerificationCode, {
                    where: {
                        user: {
                            id: user.id
                        },
                        usedAt: IsNull(),
                    },
                    order: {
                        createdAt: 'DESC',
                    },
                    lock: {
                        mode: 'pessimistic_write',
                    },
                });

                if (!verificationCode) {
                    throw new UnauthorizedException('Verification code not found');
                }

                if (verificationCode.expiresAt <= new Date()) {
                    throw new UnauthorizedException('Verification code expired');
                }

                
                const isValid = await this.passwordService.verify(
                    verificationCode.codeHash,
                    verifyEmailDto.code
                );

                if (!isValid) {
                    throw new UnauthorizedException('Invalid verification code');
                }

                verificationCode.usedAt = new Date();
                await manager.save(EmailVerificationCode, verificationCode);

                user.emailVerifiedAt = new Date();

                await manager.save(User, user);

                await this.redisService.del(
                    attemptsKey
                );
            }
        )
    }
}
