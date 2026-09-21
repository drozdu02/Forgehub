import { Module } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEvent } from './entities/outbox-event.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([OutboxEvent])
  ],
  providers: [EventsService],
})
export class EventsModule {}
