import { HttpStatus } from '@nestjs/common';

/**
 * The AppResponse class
 **/
export class AppResponse {
  /**
   * @param {Boolean} success the meta object
   * @return {Object} The success response object
   * */
  static getSuccessMeta(success = true) {
    return { statusCode: HttpStatus.OK, success };
  }

  /**
   * @param {Object} meta the meta object
   * @param {Object} data success response object
   * @return {Object} The success response object
   * */
  static format(meta: any, data = null): any {
    const response: any = {};
    response.meta = meta;
    if (data) {
      response.data = data;
    }
    return response;
  }
}
