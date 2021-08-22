import { ConfigService } from '@nestjs/config';
import _ from 'lodash';
import { Document } from 'mongoose';
import { BaseService } from './base.service';
import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Next,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Pagination, QueryParser } from '../common';
import { AppException } from '../expections';

export class BaseController<T extends Document> {
  protected lang: any = {
    get: (key = 'data') => {
      return {
        created: 'Data successfully created',
        updated: 'Data successfully updated',
        deleted: 'Data successfully deleted',
        not_found: 'Data not found',
      };
    },
  };

  constructor(
    protected config: ConfigService,
    protected service: BaseService<T>,
  ) {}

  /**
   * @param {Request.body} payload The request body object
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<any> {
    try {
      const queryParser: QueryParser = new QueryParser(_.assign({}, req.query));
      if (!this.service.routes.create) {
        next(AppException.NOT_FOUND);
      }
      let value: any = await this.service.retrieveExistingResource(payload);
      if (value) {
        const returnIfFound = this.service.Model.config().returnDuplicate;
        if (!returnIfFound) {
          const messages: any = this.service.Model.config().uniques.map(
            (m: any | string) => ({ [m]: `${m} must be unique` }),
          );
          const appError = new AppException(
            'Duplicate record is not allowed',
            HttpStatus.CONFLICT,
            messages,
          );
          return next(appError);
        }
      } else {
        const checkError = await this.service.validateCreate(payload);
        if (checkError) {
          return next(checkError);
        }
        value = await this.service.createNewObject({
          ...payload,
          auth: req['auth'],
        });
        const response = await this.service.getResponse({
          queryParser,
          value,
          code: HttpStatus.CREATED,
          message: this.lang.get(this.service.modelName).created,
        });
        return res.status(HttpStatus.OK).json(response);
      }
    } catch (e) {
      return next(e);
    }
  }

  /**
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  @Get('/')
  @HttpCode(HttpStatus.OK)
  public async find(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<any> {
    const queryParser: QueryParser = new QueryParser(_.assign({}, req.query));
    const pagination: Pagination = new Pagination(
      req.originalUrl,
      this.service.baseUrl,
      this.service.itemsPerPage,
    );
    try {
      const { value, count } = await this.service.buildModelQueryObject(
        pagination,
        queryParser,
      );
      const response: any = await this.service.getResponse({
        code: HttpStatus.OK,
        value,
        count,
        queryParser,
        pagination,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  /**
   * @param {Any| Request.params.id} id The request id object
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  public async findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<any> {
    try {
      const queryParser: QueryParser = new QueryParser(_.assign({}, req.query));
      const object = await this.service.findObject(id, queryParser);
      const response: any = await this.service.getResponse({
        queryParser,
        code: HttpStatus.OK,
        value: object,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  /**
   * @param {Any| Request.params.id} id The request id object
   * @param {Any| Request.body} payload The request body object
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  public async patch(
    @Param('id') id: string,
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<any> {
    try {
      if (!this.service.routes.patch) {
        throw AppException.NOT_FOUND;
      }
      const queryParser: QueryParser = new QueryParser(_.assign({}, req.query));
      let object: any = await this.service.findObject(id, queryParser);
      object = await this.service.patchUpdate(object, {
        ...payload,
        auth: req['auth'],
      });
      const canUpdateError = await this.service.validateUpdate(object, {
        ...payload,
        auth: req['auth'],
      });
      if (!_.isEmpty(canUpdateError)) {
        throw canUpdateError;
      }
      const response: any = await this.service.getResponse({
        queryParser,
        code: HttpStatus.OK,
        value: object,
        message: this.lang.get(this.service.modelName).updated,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param('id') id: string,
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<any> {
    try {
      if (!this.service.routes.update) {
        throw AppException.NOT_FOUND;
      }
      const queryParser: QueryParser = new QueryParser(_.assign({}, req.query));
      let object: any | T = await this.service.findObject(id, queryParser);
      const canUpdateError = await this.service.validateUpdate(object, {
        ...payload,
        auth: req['auth'],
      });
      if (!_.isEmpty(canUpdateError)) {
        throw canUpdateError;
      }
      object = await this.service.updateObject(id, payload);
      const response = await this.service.getResponse({
        queryParser,
        code: HttpStatus.OK,
        value: object,
        message: this.lang.get(this.service.modelName).deleted,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  /**
   * @param {Any| Request.params.id} id The request id object
   * @param {Any| Request.body} payload The request body object
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  public async remove(
    @Param('id') id: string,
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<any> {
    try {
      if (!this.service.routes.remove) {
        throw AppException.NOT_FOUND;
      }
      let object = await this.service.findObject(id);
      const canDeleteError = await this.service.validateDelete(object);
      if (!_.isEmpty(canDeleteError)) {
        throw canDeleteError;
      }
      object = await this.service.deleteObject(object);
      const response = await this.service.getResponse({
        code: HttpStatus.OK,
        value: { _id: object._id },
        message: this.lang.get(this.service.modelName).deleted,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      return next(e);
    }
  }
}
