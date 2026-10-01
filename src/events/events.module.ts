import { Module } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [EventsService],
})
export class EventsModule {}
