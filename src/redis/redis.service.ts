// redis.service.ts
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            host: '127.0.0.1', // Replace with your Redis host
            port: 6379,        // Replace with your Redis port
            password: '',      // Add password if necessary
        });
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redis.set(key, value, 'EX', ttl); // Set key with expiration time
        } else {
            await this.redis.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }

    async delete(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async close(): Promise<void> {
        await this.redis.quit();
    }
}
