import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly client: Redis

    constructor(
        private readonly configService: ConfigService
    ) {
        this.client = new Redis({
            host: configService.getOrThrow<string>(
                'REDIS_HOST'
            ),
            port: Number(configService.getOrThrow<number>(
                'REDIS_PORT'
            )),
        });
    }

    async onModuleInit(): Promise<void> {
        await this.client.ping();
    }

    async onModuleDestroy(): Promise<void> {
        await this.client.quit();
    }

    async get(
        key: string
    ): Promise<string | null> {
        return this.client.get(key);
    }

    async set(
        key: string,
        value: string,
        ttlSeconds?: number
    ): Promise<void> {
        if (ttlSeconds !== undefined) {
            await this.client.set(
                key,
                value,
                'EX',
                ttlSeconds
            );
            return;
        }

        await this.client.set(key, value);
    }

    async setIfNotExists(
        key: string,
        value: string,
        ttlSeconds?: number
    ): Promise<boolean> {
        const result = await this.client.set(
            key,
            value,
            'EX',
            ttlSeconds ?? 0,
            'NX',
        );
        return result === 'OK';
    }

    async del(
        key: string
    ): Promise<void> {
        await this.client.del(
            key
        );
    }

    async exists(
        key: string
    ): Promise<boolean> {
        return (await this.client.exists(key)) === 1;
    }

    async increment(
        key: string
    ): Promise<number> {
        return this.client.incr(key);
    }

    async incrementWithTtl(
        key: string,
        ttlSeconds: number
    ): Promise<number> {
        const count = await this.client.incr(key);

        if (count === 1) {
            await this.client.expire(
                key,
                ttlSeconds
            );
        }
        return count;
    }

    async expire(
        key: string,
        ttlSeconds: number
    ): Promise<void> {
        await this.client.expire(
            key, 
            ttlSeconds
        );
    }




}
