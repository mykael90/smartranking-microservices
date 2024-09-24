import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Game } from './game.schema';
import { ChallengeStatus } from './challenge-status.enum';

@Schema({ timestamps: true, collection: 'challenges' })
export class Challenge extends Document {
  @Prop()
  challengeDate: Date;

  @Prop({ enum: ChallengeStatus })
  status: ChallengeStatus;

  @Prop()
  requestDate: Date;

  @Prop()
  responseDate: Date;

  @Prop({ type: Types.ObjectId })
  requester: string;

  @Prop()
  category: string;

  @Prop({ type: [{ type: Types.ObjectId }] })
  players: string[];

  @Prop({ type: Types.ObjectId, ref: 'Game' })
  game: Game;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
