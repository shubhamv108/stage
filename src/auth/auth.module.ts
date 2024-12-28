// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from "../list/list.servce";
import {RedisModule} from "../redis/redis.module";
import {ListModule} from "../list/list.module";
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "../models/user.schema";

@Module({
    imports: [
        ListModule,
        RedisModule,
        PassportModule,
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.register({
            secret: 'your-secret-key', // Replace with an environment variable for security
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [AuthService, UserService, JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
