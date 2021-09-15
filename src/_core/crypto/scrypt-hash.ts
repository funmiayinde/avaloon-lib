import {
  ScryptOptions,
  scrypt as scryptCallback,
  randomBytes,
  timingSafeEqual,
} from 'crypto';
import { promisify } from 'util';

type ScryptFn = (
  password: string | Buffer | NodeJS.TypedArray | DataView,
  salt: string | Buffer | NodeJS.TypedArray | DataView,
  keylen: number,
  options?: ScryptOptions,
) => Promise<Buffer>;

const scrypt: ScryptFn = promisify(scryptCallback);

const SALT_LENGTH = 24;
const SCRYPT_KEY_LENGTH = 32;

// Must be a power of two greater than one. Default is 2**14 = 16384
const SCRYPT_OPT_COST = 2 ** 15;
// Default is 8
const SCRYPT_OPT_BLOCK_SIZE = 8;
const SCRYPT_OPT_PARALLELIZE = 1;

// Memory upper bound.
// It is an error when (appoximately) 128 * COST * BLOCK_SIZE > MAXMEM.
// Default: 322 * 1024 * 1024.
const SCRYPT_OPT_MAXMEM = 256 * SCRYPT_OPT_COST * SCRYPT_OPT_BLOCK_SIZE; // 64 * 1024 * 1024;

export type HashOptions = ScryptOptions & {
  saltLen?: number;
  hashLen?: number;
};

export const DefaultOptions: HashOptions = {
  N: SCRYPT_OPT_COST,
  r: SCRYPT_OPT_BLOCK_SIZE,
  p: SCRYPT_OPT_PARALLELIZE,
  maxmem: SCRYPT_OPT_MAXMEM,
  saltLen: SALT_LENGTH,
  hashLen: SCRYPT_KEY_LENGTH,
};

export class ScryptHash {
  /**
   * Key Derivation Function
   *
   * Usage:
   *   await SCryptHash.hash('AmazingPassword123');
   *
   * Example output:
   *   '5Uvh9yKdstm8zaVH1lGBd/ok7N96DT38.wpyY+XGeeVmTxDXs2degUJMBZWKib2gTrNewpcJvUjU='
   *
   * IMPORTANT:
   * Denial of Service attacks are possible if called with exceptionally-long password string.
   * Those should be mitigated by controllers with password length constraint in place.
   *
   * @param {String} password
   * @param {HashOptions} options?
   * @return base64-encoded salt.hash pair separated with dot (.)
   */
  static async hash(password: string, options?: HashOptions): Promise<string> {
    const opts: HashOptions = ScryptHash._applyOptions(options);
    const salt = randomBytes(opts.saltLen);
    const hash = await ScryptHash._hash(password, salt, opts);
    return [salt.toString('base64'), hash.toString('base64')].join('.');
  }
  /**
   * Password verification.
   *
   * Usage:
   *   await SCryptHash.verify( 'AmazingPassword123',
   *     '5Uvh9yKdstm8zaVH1lGBd/ok7N96DT38.wpyY+XGeeVmTxDXs2degUJMBZWKib2gTrNewpcJvUjU=' );
   *
   * Will return true for the correct password and salt.hash combination.
   *
   * IMPORTANT:
   * Denial of Service attacks are possible if called with exceptionally-long password string.
   * Those should be mitigated by controllers with password length constraint in place.
   *
   * Timing attacks (and probably padding attacks) are possible on verify,
   * but only with malformed hash (saltWithHash) string, not with password input.
   * So hash should always come from DB, etc. and not from todo input.
   *
   * @param {String} checkPassword
   * @param {String} saltWithHash base64-encoded salt.hash pair separated with dot (.)
   * @param {HashOptions} options?
   * @return false on password mismatch or decoding error
   */
  static async verify(
    checkPassword: string,
    saltWithHash: string,
    options?: HashOptions,
  ): Promise<boolean> {
    try {
      const opts: HashOptions = ScryptHash._applyOptions(options);
      const [b64salt, b64hash] = saltWithHash.split('.');
      const salt: Buffer = Buffer.from(b64salt, 'base64');
      const hash: Buffer = Buffer.from(b64hash, 'base64');
      const checkHash: Buffer = await ScryptHash._hash(
        checkPassword,
        salt,
        opts,
      );
      return timingSafeEqual(checkHash, hash);
    } catch (e) {
      return false;
    }
  }
  protected static _applyOptions(options: HashOptions): HashOptions {
    const result: HashOptions = { ...DefaultOptions };
    for (const k in options) {
      if (k in DefaultOptions) {
        result[k] = options[k];
      }
    }
    return result;
  }
  protected static async _hash(
    password: string | Buffer | NodeJS.TypedArray | DataView,
    salt: string | Buffer | NodeJS.TypedArray | DataView,
    options: HashOptions = DefaultOptions,
  ): Promise<Buffer> {
    return scrypt(password, salt, options.hashLen, options);
  }
}
