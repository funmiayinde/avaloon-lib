import { AppException } from './app.exception';
import { HttpStatus } from '@nestjs/common';

export class ErrorException extends AppException {
  constructor(
    message: string,
    status: number,
    protected objectOrError?: string | any,
  ) {
    super(message, status, 0, objectOrError);
  }

  getStatus(): number {
    return HttpStatus.BAD_REQUEST;
  }

  getResponse(): any {
    const obj: any = {
      code: this.getStatus() || 500,
      message: this.message || 'An error occurred, please try again later',
    };
    if (this.objectOrError) {
      obj.messages = this.objectOrError;
    }
    return obj;
  }
}
