import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity.js';
import { PasswordService } from './password.service.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { Session } from './entities/session.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { EmailVerificationCode } from './entities/email-verification-code.entity.js';
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Session, Project, EmailVerificationCode]),
    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string> (
          'JWT_ACCESS_SECRET'
        ),
        
        signOptions: {
          expiresIn: configService.getOrThrow<number> (
            'JWT_EXPIRES_IN'
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, JwtStrategy],
})
export class AuthModule {}
