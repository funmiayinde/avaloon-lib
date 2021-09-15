import { ModuleMetadata } from '@nestjs/common';
import { Redis, RedisOptions } from 'ioredis';
import * as redis from 'ioredis';

export interface CacheOptions extends RedisOptions {
  name?: string;
  url?: string;
  onClientReady?(client: Redis): void;
}

export interface CacheClient {
  defaultKey: string;
  clients: Map<string, redis.Redis>;
  size: number;
}

export interface CacheAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (
    ...args: any[]
  ) =>
    | CacheOptions
    | CacheOptions[]
    | Promise<CacheOptions>
    | Promise<CacheOptions>;
  inject?: any[];
}
