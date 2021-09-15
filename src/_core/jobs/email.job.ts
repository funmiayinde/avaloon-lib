import { Job } from './job';
import { WorkerQueue } from '../common';

export interface IEmailName {
  email: string;
  name?: string;
  fromEmail?: string;
}

export class EmailJob extends Job {
  private from: IEmailName;
  private to: IEmailName | IEmailName[];
  private subject: string;
  private template: string;
  private content: any;

  constructor() {
    super(WorkerQueue.PROCESS_WORK);
  }

  public setFrom(value: IEmailName) {
    this.from = value;
    return this;
  }

  public setTo(value: IEmailName | IEmailName[]) {
    this.to = value;
    return this;
  }

  public setSubject(value: string) {
    this.subject = value;
    return this;
  }

  public setTemplate(value: string) {
    this.template = value;
    return this;
  }

  public setContent(content: any) {
    this.content = content;
    return this;
  }
}
