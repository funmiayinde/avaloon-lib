export enum QueueTasks {
  UPLOAD_PHOTO = 'task.upload.photo',
  SEND_SMS = 'task.send.sms',
  SEND_EMAIL = 'task.send.email',
  PING = 'task.send.ping',
}

export enum WorkerQueue {
  PROCESS_WORK = 'wevied.jobs.process.work',
}

export enum AppStatus {
  WORKER_ERROR = 1000,
}
