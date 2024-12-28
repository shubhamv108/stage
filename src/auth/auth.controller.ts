import {Controller, Post, Body, UnauthorizedException, UseGuards, Req, HttpStatus} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {LoginDto} from "./dto/login.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

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
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
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
    async logout(@Req() req: any) {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            await this.authService.blacklistToken(token);
        }
        return { message: 'Successfully logged out' };
    }
}