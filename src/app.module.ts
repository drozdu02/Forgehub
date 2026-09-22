import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserModule } from './user/user.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module.js';
import { BullModule } from '@nestjs/bullmq';
import { MailModule } from './mail/mail.module.js';
import { EventsModule } from './events/events.module.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditModule } from './audit/audit.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379
      }
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'forgehub',
      password: 'forgehub',
      database: 'forgehubdb',
      autoLoadEntities: true,
      synchronize: false,
    }), UserModule, OrganizationsModule, TasksModule, ProjectsModule, AuthModule, RedisModule, MailModule, EventsModule, AuditModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
