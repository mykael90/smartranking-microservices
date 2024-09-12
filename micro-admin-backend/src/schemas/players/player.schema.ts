import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'players' })
export class Player extends Document {
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
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
