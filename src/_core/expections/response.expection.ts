import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppException } from './app.exception';
import { MongoError } from 'mongodb';
import _ from 'lodash';

@Catch()
export class ResponseException implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const meta: any = {};
    if (
      exception instanceof AppException ||
      exception instanceof HttpException
    ) {
      _.extend(meta, {
        status_code: exception.getStatus(),
        error: exception.getResponse(),
      });
    } else if (exception instanceof MongoError) {
      const code = HttpStatus.FAILED_DEPENDENCY;
      _.extend(meta, {
        status_code: code,
        error: {
          code,
          message: 'Some setup problems with datastore, please try again',
        },
        developer_message: exception.message,
      });
    } else if (exception instanceof Error) {
      const code = HttpStatus.INTERNAL_SERVER_ERROR;
      _.extend(meta, {
        status_code: code,
        error: {
          code,
          message: exception.message,
        },
        developer_message: exception,
      });
    } else {
      const code = HttpStatus.INTERNAL_SERVER_ERROR;
      _.extend(meta, {
        status_code: code,
        error: {
          code,
          message: 'A problem with our server, please try again later',
        },
        developer_message: exception,
      });
    }
    if (process.env.NODE_ENV === 'production') {
      _.omit(meta, ['developer_message']);
    }
    response.status(meta.status_code).json({ meta });
  }
}
