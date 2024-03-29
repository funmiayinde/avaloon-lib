import { IEmailName } from '../jobs';

export interface MailOption {
  emailName: IEmailName;
  fromEmail: IEmailName;
  subject: string;
  template: string;
  content?: any;
}
