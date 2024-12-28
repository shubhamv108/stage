// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {UserService} from "../list/list.servce";
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private redisService: RedisService,
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        return this.userService.validateUser(username, password);
    }

    async login(user: any) {
        const payload = { username: user._doc.username };
        return {
            access_token: this.jwtService.sign(payload), // This will include username as a claim
        };
    }

    async blacklistToken(token: string): Promise<void> {
        const decodedToken = this.jwtService.decode(token) as any;
        const exp = decodedToken.exp; // Token expiration time
        const ttl = exp - Math.floor(Date.now() / 1000); // Remaining time to live

        // Add token to Redis or cache for the remaining time
        await this.redisService.set(token, 'blacklisted', ttl);
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        return (await this.redisService.get(token)) === 'blacklisted';
    }
}
