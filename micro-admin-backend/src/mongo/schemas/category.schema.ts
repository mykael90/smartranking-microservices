import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Player } from './player.schema';

export interface Event {
  name: string;
  operation: string;
  value: number;
}

const EventSchema = new MongooseSchema<Event>({
  name: { type: String, required: true },
  operation: { type: String, required: true },
  value: { type: Number, required: true },
});

@Schema({ timestamps: true, collection: 'categories' })
export class Category extends Document {
  _id: Types.ObjectId;

  @Prop({ unique: true })
  category: string;

  @Prop()
  description: string;

  @Prop({ type: [EventSchema] })
  events: Event[];

  @Prop({ type: [{ type: Types.ObjectId, ref: Player.name }] })
  players: Types.ObjectId[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
