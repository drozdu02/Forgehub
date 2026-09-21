import { Controller } from '@nestjs/common';
import { RedisService } from './redis.service.js';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}
}
