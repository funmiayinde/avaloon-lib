import { AppException } from './app.exception';
import { HttpStatus } from '@nestjs/common';
import { AppStatus } from '../common';

export class WorkerExpection extends AppException {
  constructor(
    err: any,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    code: number = AppStatus.WORKER_ERROR,
    message = 'Worker Exception',
  ) {
    super(err, code, status, message);
  }
}
