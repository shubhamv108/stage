import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from '../models/movie.schema';
import {User, UserSchema} from "../models/user.schema";
import {UserService} from "../list/list.servce";
import {MoviesService} from "../movies/movies.service";
import {SeedService} from "./seed.service";
import {TVShow, TVShowSchema} from "../models/tvshow.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: TVShow.name, schema: TVShowSchema }]),
  ],
  providers: [UserService, MoviesService, SeedService],
})
export class SeedModule {}
