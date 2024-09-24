import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface Result {
  set: string;
}

@Schema({ timestamps: true, collection: 'games' })
export class Game extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Challenge' })
  challenge: string;

  @Prop({ type: Types.ObjectId })
  category: string;

  @Prop({ type: [{ type: Types.ObjectId }] })
  players: string[];

  @Prop({ type: Types.ObjectId })
  def: string;

  @Prop({ type: [{ set: { type: String } }] })
  result: Result[];
}

export const GameSchema = SchemaFactory.createForClass(Game);
