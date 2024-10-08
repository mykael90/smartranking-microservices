import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from './category.schema';

@Schema({ timestamps: true, collection: 'players' })
export class Player extends Document {
  _id: Types.ObjectId;

  @Prop({ unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop()
  ranking: string;

  @Prop()
  position: number;

  @Prop()
  photo: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
