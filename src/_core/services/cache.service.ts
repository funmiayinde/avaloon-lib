import { Inject, Injectable } from '@nestjs/common';
import { CACHE_CLIENT } from '../constants/cache.constant';
import { CacheClient } from '../interfaces/cache-option';
import { Redis } from 'ioredis';
import { CacheException } from '../exceptions/cache.exception';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_CLIENT) private readonly cacheClient: CacheClient,
  ) {}

  getClient(name?: string): Redis {
    if (!name) {
      name = this.cacheClient.defaultKey;
    }
    if (!this.cacheClient.clients.has(name)) {
      throw new CacheException(`client ${name} does not exist`);
    }
    return this.cacheClient.clients.get(name);
  }
  getClients(): Map<string, Redis> {
    return this.cacheClient.clients;
  }
}
