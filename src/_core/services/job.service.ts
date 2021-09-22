import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueueTasks, WorkerService } from '../common';
import { ClientProxy } from '@nestjs/microservices';
import { Job } from '../jobs';
import { WorkerExpection } from '../exceptions/worker.expection';

@Injectable()
export class JobService {
  constructor(
    @Inject(WorkerService.WORKER_SERVICE_TOKEN)
    private readonly client: ClientProxy,
  ) {}

  public addJobQueue(job: Job, task: QueueTasks) {
    Logger.log(`Sent Job:::${job.queueName} Task:${task}`);
    this.client.send(task, job).subscribe(
      (res) =>
        Logger.log(
          `Finished Job::: ${job.queueName}, Task:${task} in ${res.duration}`,
        ),
      (e) => Logger.error(new WorkerExpection(e)),
    );
  }

  public send(task: any, job: Job) {
    Logger.log(`Sent Job:::${job.queueName} Task:${task}`);
    this.client.send(task, job.getData()).subscribe(
      (res) => Logger.log(`${job.queueName}, Task:${task} in ${res.duration}`),
      (err) => Logger.error(new WorkerExpection(err)),
    );
  }
}
