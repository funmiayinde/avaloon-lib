import { WorkerQueue, WorkerService } from '../common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const WORKER_PROVIDERS = [
  {
    provide: WorkerService.WORKER_SERVICE_TOKEN,
    useFactory: (config: ConfigService) => {
      Logger.log(`Rabbit MQ URL: ${config.get('service.rabbitMQ')}`);
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [config.get('service.rabbitMQ.url')],
          queue: WorkerQueue.PROCESS_WORK,
          queueOptions: { durable: true },
        },
      });
    },
    inject: [ConfigService],
  },
];
