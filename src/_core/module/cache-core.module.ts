import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnModuleDestroy,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CacheOptions } from 'cache-manager';
import _ from 'lodash';
import {
  CACHE_CLIENT,
  CACHE_MODULE_OPTIONS,
} from '../constants/cache.constant';
import { CacheAsyncOptions, CacheClient } from '../interfaces/cache-option';
import { createAsyncClient, createClient } from '../providers/cache.provider';
import { CacheService } from '../services/cache.service';

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheCoreModule implements OnModuleDestroy {
  constructor(
    @Inject(CACHE_MODULE_OPTIONS)
    private readonly options: CacheOptions | Array<CacheOptions>,
    private readonly moduleRef: ModuleRef,
  ) {}

  static register(options: CacheOptions | Array<CacheOptions>): DynamicModule {
    return {
      module: CacheCoreModule,
      providers: [
        createClient(),
        {
          provide: CACHE_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [CacheService],
    };
  }

  static forRootAsync(options: CacheAsyncOptions): DynamicModule {
    return {
      module: CacheCoreModule,
      imports: options.imports,
      providers: [createClient(), createAsyncClient(options)],
      exports: [CacheService],
    };
  }

  onModuleDestroy() {
    const closeConnection =
      ({ clients, defaultKey }) =>
      (options) => {
        const name = options.name || defaultKey;
        const client = clients.get(name);
        if (client && !options.keepAlive) {
          client.disconnect();
        }
      };
    const cacheClient = this.moduleRef.get<CacheClient>(CACHE_CLIENT);
    const closeClientConnection = closeConnection(cacheClient);
    if (_.isArray(this.options)) {
      this.options.forEach(closeClientConnection);
    } else {
      closeClientConnection(this.options);
    }
  }
}
