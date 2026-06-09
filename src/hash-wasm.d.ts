declare module 'hash-wasm' {
  export interface Argon2Options {
    password: string | Uint8Array;
    salt: Uint8Array;
    iterations: number;
    memorySize: number;
    parallelism: number;
    hashLength: number;
    outputType?: 'encoded' | 'hex' | 'binary';
  }

  export function argon2id(options: Argon2Options): Promise<string>;
  export function argon2i(options: Argon2Options): Promise<string>;
  export function argon2d(options: Argon2Options): Promise<string>;
}
