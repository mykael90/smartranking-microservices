import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'scores' })
export class Score extends Document {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  player: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  challenge: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  game: Types.ObjectId;

  @Prop()
  eventName: string;

  @Prop()
  eventOperation: string;

  @Prop()
  score: number;
}

export const ScoreSchema = SchemaFactory.createForClass(Score);
