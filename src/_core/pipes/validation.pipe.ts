import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ErrorException } from '../exceptions';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const formatted = ValidationPipe.formatErrors(errors);
      throw new ErrorException(
        'Bad request / Validator error',
        HttpStatus.BAD_REQUEST,
        formatted,
      );
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  static formatErrors(errors: ValidationError[]) {
    const formatted = {};
    const getNestedErrors = (error) => {
      if (error.children.length === 0) {
        return error.constraints;
      } else {
        return this.formatErrors(error.children);
      }
    };
    errors.forEach((error) => {
      formatted[error.property] = getNestedErrors(error);
    });
    return formatted;
  }
}
