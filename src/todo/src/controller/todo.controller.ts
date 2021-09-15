import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Next,
  Req,
  Res,
  Post,
  Param,
  Put,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseController } from 'src';
import { CreateTodoDto } from 'src/todo/dto/create-todo.dto';
import { TodoService } from 'src/todo/todo.service';
import { TodoDocument } from '../entity/todo.entity';
import { NextFunction, Request, Response } from 'express';
import { UpdateTodoDto } from 'src/todo/dto/update-todo';

@Controller('todos')
export class TodoController extends BaseController<TodoDocument> {
  constructor(protected service: TodoService, protected config: ConfigService) {
    super(config, service);
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() payload: CreateTodoDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    super.create(payload, req, res, next);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param('id') id: string,
    @Body() payload: UpdateTodoDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    super.update(id, payload, req, res, next);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  public async patch(
    @Param('id') id: string,
    @Body() payload: UpdateTodoDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    super.patch(id, payload, req, res, next);
  }
}
