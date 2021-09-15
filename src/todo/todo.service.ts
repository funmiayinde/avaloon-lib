import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../_core';
import { Todo, TodoDocument } from './src/entity/todo.entity';

@Injectable()
export class TodoService extends BaseService<TodoDocument> {
  constructor(
    @InjectModel(Todo.name) protected model: Model<TodoDocument>,
    protected config: ConfigService,
  ) {
    super(model);
  }
}
