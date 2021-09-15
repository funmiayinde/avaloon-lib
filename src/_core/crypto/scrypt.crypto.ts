import { from, Observable } from 'rxjs';
import { ScryptHash } from './scrypt-hash';
import { ICrypto } from './crypto.interface';

export class SCryptCrypto implements ICrypto {
  async hash(password: string): Promise<string> {
    return ScryptHash.hash(password);
  }
  compare(password: string, hash: string): Promise<boolean> {
    return ScryptHash.verify(password, hash);
  }
  rxHash(password: string): Observable<string> {
    return from(this.hash(password));
  }
  rxCompare(password: string, hash: string): Observable<boolean> {
    return from(this.compare(password, hash));
  }
}
export const SCryptCryptoFactory = new SCryptCrypto();
