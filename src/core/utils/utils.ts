import * as crypto from 'crypto';
import _ from 'lodash';
import mongoose from 'mongoose';
import * as IdGenerator from 'auth0-id-generator';
import { QueryParser } from '../common';
import moment from 'moment-timezone';

/**
 * The Util class
 **/
export class Utils {
  /**
   * check if is a valid mongoose id
   * @param {Object} value
   * @return  {Boolean}
   * */
  public static isObjectId(value: any | string): boolean {
    return (
      value &&
      value.length > 12 &&
      String(mongoose.Types.ObjectId(value)) === String(value)
    );
  }

  public static generateRandomID(length: number): string {
    return crypto.randomBytes(length / 2).toString('hex');
  }

  /**
   * @param {String} key the prefix for the id
   * @param {Number} length the length of the id
   * @return {Date} The date
   * */
  public static generateUniqueId(key: string, length = 20) {
    const generator = new IdGenerator();
    return generator.new(key || 'key');
  }

  /**
   * @param {String} objectIds
   * @param {QueryParser} queryParser
   * @return {Object} obj The allowed date range
   * */
  public static aggregateFilterByObjectId(
    objectIds: string[],
    queryParser: QueryParser,
  ) {
    try {
      const filter: any = {};
      for (const key of objectIds) {
        if (queryParser.query[key]) {
          filter[key] = _.isArray(queryParser.query[key])
            ? {
                $in: filter[key]
                  ? queryParser.query[key].map((v: string) =>
                      mongoose.Types.ObjectId(v),
                    )
                  : [],
              }
            : mongoose.Types.ObjectId(queryParser.query[key]);
        }
      }
      return filter;
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {Date} date
   * @return {Date}
   * */
  public static getDueToday(date: Date = new Date()) {
    const fromDate = moment(date).startOf('day');
    const toDate = moment(date).endOf('day');
    return {
      $lte: new Date(toDate.toISOString()),
      $gte: new Date(fromDate.toISOString()),
    };
  }

  /**
   * @param {Object} obj
   * @return {Date}
   * */
  public static getRangeByDate(obj: any = {}) {
    try {
      const range: any = JSON.parse(obj);
      if (range && range.fromDate && range.toDate) {
        const fromDate = moment(range.fromDate).startOf('day');
        const toDate = moment(range.toDate).endOf('day');
        return {
          $gte: new Date(fromDate.toISOString()),
          $lte: new Date(toDate.toISOString()),
        };
      }
      const { fromDate, toDate } = range || {};
      return { ...this.getDueToday(fromDate || toDate || new Date()) };
    } catch (e) {
      return { ...this.getDueToday(obj) };
    }
  }

  /**
   * @param {Number} size code length
   * @param {Boolean} alpha Check if it's alpha numeral
   * @return {String} The code
   **/
  public static generateCode = (size = 4, alpha = false) => {
    const result: any = [];
    const characters: string | string[] = alpha
      ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      : '0123456789';

    for (let i = 0; i < size; i++) {
      result.push(
        characters.charAt(Math.floor(Math.random() * characters.length)),
      );
    }
    return result.join('');
  };
  /**
   * Convert callback to promise;
   *  @param {String} string
   *  @param {String} otherKey
   * @return {String} params date
   */
  public static encrypt = (string: any, otherKey = '') => {
    if (string === null || typeof string === 'undefined') {
      return string;
    }
    let key = `${process.env.ENCRYPTION_KEY}${otherKey}`;
    key = crypto.createHash('md5').update(key).digest('hex');
    let iv: string = process.env.ENCRYPTION_KEY || key;
    iv = crypto.createHash('md5').update(iv).digest('hex').substr(0, 16);
    const cipher: any = crypto.createCipheriv(
      'aes-256-ctr',
      Buffer.from(key),
      iv,
    );
    return cipher.update(string, 'utf8', 'hex') + cipher.final('hex');
  };

  /**
   * Convert callback to promise;
   *  @param {String} encrypted
   *  @param {String} otherKey
   * @return {String} params date
   */
  public static decryptFixed = (encrypted: any, otherKey = '') => {
    if (encrypted === null || typeof encrypted === 'undefined') {
      return encrypted;
    }
    let key = `${process.env.ENCRYPTION_KEY}${otherKey}`;
    key = crypto.createHash('md5').update(key).digest('hex');
    let iv: string = process.env.ENCRYPTION_KEY || key;
    iv = crypto.createHash('md5').update(iv).digest('hex').substr(0, 16);
    const decipher: any = crypto.createDecipheriv(
      'aes-256-ctr',
      new Buffer(key),
      new Buffer(iv),
    );
    try {
      const cip =
        decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
      return cip;
    } catch (e) {
      return encrypted;
    }
  };
}
