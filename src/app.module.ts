import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoviesModule } from './movies/movies.module';
import { TvshowsModule } from './tvshows/tvshows.module';
import { ListModule } from './list/list.module';
import { AuthModule } from './auth/auth.module';
import {SeedModule} from "./seed/seed.module";

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/stagedb'),
    MoviesModule,
    TvshowsModule,
    ListModule,
    AuthModule,
    SeedModule,
  ],
})
export class AppModule {}
