import {ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {JwtService} from "@nestjs/jwt";
import {Observable} from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly jwtService: JwtService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1]; // Extract token

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
}