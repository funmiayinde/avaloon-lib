import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true, autoCreate: true })
export class Todo {
  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  public_id: string;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  active: boolean;

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  deleted: boolean;

  static seachQuery(q: string) {
    const regex = new RegExp(q);
    return [
      { title: { $regex: regex, $options: 'i' } },
      { description: { $regex: regex, $options: 'i' } },
    ];
  }
}

const TodoSchema: any = SchemaFactory.createForClass(Todo);

TodoSchema.statics.config = () => {
  return {
    idToken: 'tdd',
    softDelete: true,
    fillables: ['title', 'description'],
    hiddenFields: ['deleted'],
  };
};

TodoSchema.statics.searchQuery = (q: string) => {
  const regex = new RegExp(q);
  return [
    { title: { $regex: regex, $options: 'i' } },
    { description: { $regex: regex, $options: 'i' } },
  ];
};

export { TodoSchema };
