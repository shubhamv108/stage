import {Injectable, UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'your-secret-key',
        });
    }

    async validate(payload: any) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(payload);

        // Check if the token is blacklisted
        const isBlacklisted = await this.authService.isTokenBlacklisted(token);
        if (isBlacklisted) {
            throw new UnauthorizedException('Token is blacklisted');
        }

        return { userId: payload.sub, username: payload.username };
    }
}