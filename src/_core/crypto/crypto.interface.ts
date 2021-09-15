import { Observable } from 'rxjs';

export interface ICrypto {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
  rxHash(password: string): Observable<string>;
  rxCompare(password: string, hash: string): Observable<boolean>;
}
