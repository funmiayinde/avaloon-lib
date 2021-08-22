import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobService } from './job.service';
import { MailOption, SmsOption } from '../interfaces';
import { EmailJob, IEmailName, SmsJob } from '../jobs';
import { QueueTasks } from '../common';

@Injectable()
export class CoreService {
  constructor(
    private readonly config: ConfigService,
    private readonly jobService: JobService,
  ) {}

  queueToSendEmail({
    emailName,
    fromEmail,
    content,
    subject,
    template,
  }: MailOption) {
    this.handleEmail(emailName, fromEmail, subject, template, content);
  }

  queueToSendSMS(option: SmsOption) {
    this.handleSMS(option);
  }

  handleEmail(
    emailName: IEmailName,
    fromEmail: IEmailName,
    subject: string,
    template: string,
    additionContent: any = {},
  ) {
    const emailJob = new EmailJob()
      .setFrom(fromEmail)
      .setTo(emailName)
      .setSubject(subject)
      .setTemplate(template)
      .setContent(additionContent);

    this.jobService.addJobQueue(emailJob, QueueTasks.SEND_EMAIL);
  }

  handleSMS({ content, template, mobile: { phoneNumber } }: SmsOption) {
    const job = new SmsJob()
      .setFrom(content.from || '')
      .setTo(phoneNumber)
      .setTemplate(template)
      .setContent(content || {});

    this.jobService.addJobQueue(job, QueueTasks.SEND_SMS);
  }
}
