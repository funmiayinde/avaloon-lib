import { Provider } from '@nestjs/common';
import * as Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import {
  CACHE_CLIENT,
  CACHE_MODULE_OPTIONS,
} from '../constants/cache.constant';
import {
  CacheAsyncOptions,
  CacheClient,
  CacheOptions,
} from '../interfaces/cache-option';
import _ from 'lodash';
import { CacheException } from '../exceptions/cache.exception';

const getClient = async (options: CacheOptions): Promise<Redis.Redis> => {
  const { onClientReady, url, ...opt } = options;
  const client = url ? new Redis(url) : new Redis(opt);
  if (onClientReady) {
    onClientReady(client);
  }
  return client;
};

const createClient = (): Provider => ({
  provide: CACHE_CLIENT,
  useFactory: async (
    options: CacheOptions | CacheOptions[],
  ): Promise<CacheClient> => {
    const clients = new Map<string, Redis.Redis>();
    let defaultKey = uuidv4();
    if (_.isArray(options)) {
      await Promise.all([
        options.map(async (opt) => {
          const key = opt.name || defaultKey;
          if (clients.has(key)) {
            throw new CacheException(
              `${opt.name || 'default'} client already exist`,
            );
          }
          clients.set(key, await getClient(opt));
        }),
      ]);
    } else {
      if (options.name && options.name.length !== 0) {
        defaultKey = options.name;
      }
      clients.set(defaultKey, await getClient(options));
    }
    return {
      defaultKey,
      clients,
      size: clients.size,
    };
  },
  inject: [CACHE_MODULE_OPTIONS],
});

const createAsyncClient = (option: CacheAsyncOptions) => ({
  provide: CACHE_MODULE_OPTIONS,
  useFactory: option.useFactory,
  inject: option.inject,
});

export { createAsyncClient, createClient };
