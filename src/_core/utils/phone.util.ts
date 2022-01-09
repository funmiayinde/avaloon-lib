import { BadRequestException } from '@nestjs/common';
import {
  PhoneNumber,
  PhoneNumberFormat,
  PhoneNumberUtil,
} from 'google-libphonenumber';

export class PhoneUtils {
  static phoneUtil = PhoneNumberUtil.getInstance();

  static comparePhone(localFormat: string, internationalizedFormat: string) {
    return (
      this.isValidNumber(localFormat, 'NG') &&
      this.format(localFormat, 'NG') === internationalizedFormat
    );
  }

  static isValidNumber(phone: string, countryCode = 'NG') {
    let number: PhoneNumber;
    try {
      number = this.phoneUtil.parse(phone, countryCode);
    } catch (e) {}
    return number && this.phoneUtil.isValidNumber(number);
  }

  static format(
    phone: string,
    countryCode = 'NG',
    format = PhoneNumberFormat.E164,
  ) {
    try {
      const number = this.phoneUtil.parse(phone, countryCode);
      return this.phoneUtil.format(number, format);
    } catch (e) {
      throw new BadRequestException('Phone number must be a valid');
    }
  }
}
