export interface UuidV7Api {
    uuidV7(format?: 'binary'): Uint8Array;
    uuidV7(format: 'string'): string;
    uuidV7(format: 'binary' | 'string'): Uint8Array | string;
}
export declare function uuidV7(format?: 'binary', source?: Pick<Crypto, 'getRandomValues'>): Uint8Array;
export declare function uuidV7(format: 'string', source?: Pick<Crypto, 'getRandomValues'>): string;
export declare function uuidV7(format: 'binary' | 'string', source?: Pick<Crypto, 'getRandomValues'>): Uint8Array | string;
