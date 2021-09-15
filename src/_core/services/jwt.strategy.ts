import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreException: false,
      secretOrKey: config.get<string>('app.encryption_key'),
    });
    Logger.log(`key, ${config.get<string>('app.encryption_key')}`);
  }

  async validate(payload: any) {
    Logger.log(`authId, ${payload['authId']}`);
    return {
      ...payload,
    };
  }
}
