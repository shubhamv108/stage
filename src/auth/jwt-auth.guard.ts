import {ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {JwtService} from "@nestjs/jwt";
import { RedisService } from '../redis/redis.service';
import {AuthService} from "./auth.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token= await this.extractToken(request);

        // Check if the token is blacklisted
        const isBlacklisted = await this.redisService.get(token);
        if (isBlacklisted) {
            throw new UnauthorizedException('Token has been blacklisted');
        }

        if (token) {
            try {
                const decoded = this.jwtService.verify(token); // Verify the token

                // Additional validation: Check if the username exists in the token
                if (!decoded.username) {
                    throw new UnauthorizedException('Username is missing in the token');
                }

                // Optionally, you can perform other checks based on the username
                request.user = decoded; // Attach decoded payload to the request

            } catch (error) {
                throw new UnauthorizedException('Invalid or expired token');
            }
        }

        return true;
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