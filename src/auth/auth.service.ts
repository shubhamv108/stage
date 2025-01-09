// auth.service.ts
import {Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {UserService} from "../list/list.servce";
import { RedisService } from '../redis/redis.service';
import { Response } from 'express';

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

    async login(user: any, res: Response) {
        const payload = { username: user._doc.username };
        const token = this.jwtService.sign(payload);
        // Set the cookie with HTTP-only, Secure, SameSite, and Max-Age attributes
        res.cookie('credentials', token, {
            httpOnly: true,
            secure: true, // Ensure this is true in production when using HTTPS
            sameSite: 'strict', // Options: 'strict', 'lax', or 'none' depending on your use case
            maxAge: 7 * 24 * 60 * 60 * 1000, // Token expiration in milliseconds (7 days here)
        });
        res.status(200).json({ credentials: token }).send();
        return {
            access_token: token // This will include username as a claim
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

    async extractToken(request: any) {
        let token = request.headers.authorization?.split(' ')[1]; // Extract token
        if (!token) {
            // Extract the access_token from the Cookie header
            const cookies = request.cookies;
            token = cookies?.credentials;
            if (!token) {
                throw new UnauthorizedException('Authorization token not found');
            }
        }
        return token;
    }
}
