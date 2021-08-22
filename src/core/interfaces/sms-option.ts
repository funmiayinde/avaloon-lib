import { MobileDto } from '../dto';

export interface SmsOption {
  mobile: MobileDto;
  template: string;
  content?: any;
}
