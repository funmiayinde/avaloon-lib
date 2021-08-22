import { Queueable } from '../interfaces';
import { WorkerQueue } from '../common';
import { Utils } from '../utils';

export abstract class Job implements Queueable {
  public queueName: string;
  protected id: string;
  protected data?: any;

  constructor(queueName: WorkerQueue) {
    this.queueName = queueName;
    this.id = Utils.generateRandomID(16);
  }

  public getId() {
    return this.id;
  }

  public getData() {
    return {
      id: this.getId(),
      data: this.data,
    };
  }
}
