import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Game } from './game.schema';
import { ChallengeStatus } from './challenge-status.enum';
import { GamesController } from '../../games/games.controller';

@Schema({ timestamps: true, collection: 'challenges' })
export class Challenge extends Document {
  _id: Types.ObjectId;

  @Prop()
  challengeDate: Date;

  @Prop({ enum: ChallengeStatus })
  status: ChallengeStatus;

  @Prop()
  requestDate: Date;

  @Prop()
  responseDate: Date;

  @Prop({ type: Types.ObjectId })
  requester: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  category: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId }] })
  players: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: Game.name })
  game: Types.ObjectId;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
