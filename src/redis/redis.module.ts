import { Module } from '@nestjs/common';
import { RedisService } from './redis.service.js';
import { RedisController } from './redis.controller.js';

@Module({
  controllers: [RedisController],
  providers: [RedisService],
})
export class RedisModule {}
