import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {User, UserSchema} from "../models/user.schema";
import {ListController} from "./list.controller";
import {UserService} from "./list.servce";
import {AuthModule} from "../auth/auth.module";
import {JwtModule} from "@nestjs/jwt";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: 'your-secret-key', // Replace with an environment variable for security
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ListController],
  providers: [UserService],
})
export class ListModule {}
