import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from '../models/movie.schema';
import {User, UserSchema} from "../models/user.schema";
import {ListController} from "./list.controller";
import {UserService} from "./list.servce";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ListController],
  providers: [UserService],
})
export class ListModule {}
