import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { genre } from '../constants/constants';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    type: [
      {
        type: String,
        enum: genre,
      },
    ],
  })
  favoriteGenres: string[];

  @Prop({
    type: [
      {
        type: String,
        enum: genre,
      },
    ],
  })
  dislikedGenres: string[];

  @Prop([
    {
      contentId: { type: String, required: true },
      watchedOn: { type: Date, required: true },
      rating: { type: Number, min: 1, max: 5 },
    },
  ])
  watchHistory: {
    contentId: string;
    watchedOn: Date;
    rating: number;
  }[];

  @Prop([
    {
      contentId: { type: String, required: true },
      contentType: { type: String, enum: ['Movie', 'TVShow'], required: true },
    },
  ])
  myList: {
    contentId: string;
    contentType: string;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook to hash the password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password'))
    return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
