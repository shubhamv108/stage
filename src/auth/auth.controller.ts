import {Controller, Post, Body, UnauthorizedException, UseGuards, Req, HttpStatus, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {LoginDto} from "./dto/login.dto";
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService) {}

    @Post('login')
    @ApiOperation({ summary: 'User login' }) // Operation description in Swagger
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully logged in',
        schema: {
            example: {
                access_token: 'JWT_TOKEN',
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials',
    })
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user, res);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('logout')
    @ApiOperation({
        summary: 'Logs out the user',
        description: 'This endpoint logs out the user by invalidating the JWT access token.'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully logged out',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid token or session',
    })
    async logout(@Req() req: any, @Res() res: Response) {
        const token = await this.authService.extractToken(req);
        if (token) {
            await this.authService.blacklistToken(token);
        }

        res.clearCookie('credentials', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });
        res.status(200).json({ message: 'Successfully logged out' }).send();
    }
}