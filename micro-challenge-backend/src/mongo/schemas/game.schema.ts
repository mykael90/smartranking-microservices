import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface Result {
  set: string;
}

@Schema({ timestamps: true, collection: 'games' })
export class Game extends Document {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Challenge' })
  challenge: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  category: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId }] })
  players: Types.ObjectId[];

  @Prop({ type: Types.ObjectId })
  def: Types.ObjectId;

  @Prop({ type: [{ set: { type: String } }] })
  result: Result[];
}

export const GameSchema = SchemaFactory.createForClass(Game);
