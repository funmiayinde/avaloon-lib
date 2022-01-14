import { WorkerQueue } from '../common';
import { Job } from './job';

export class BasicJob extends Job {
  constructor(data?: any) {
    super(WorkerQueue.PROCESS_WORK);
    this.data = data;
  }

  public setData(data: any) {
    this.data = data;
    return this;
  }
}
