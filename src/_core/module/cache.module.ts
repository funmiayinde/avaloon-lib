import { DynamicModule, Module } from '@nestjs/common';
import { CacheOptions } from 'cache-manager';
import { CacheAsyncOptions } from '../interfaces/cache-option';
import { CacheCoreModule } from './cache-core.module';

@Module({})
export class CacheModule {
  static register(options: CacheOptions | Array<CacheOptions>): DynamicModule {
    return {
      module: CacheModule,
      imports: [CacheCoreModule.register(options)],
    };
  }
  static forRootAsync(options: CacheAsyncOptions): DynamicModule {
    return {
      module: CacheModule,
      imports: [CacheCoreModule.forRootAsync(options)],
    };
  }
}
