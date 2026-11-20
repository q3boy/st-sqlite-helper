import type { CapsuleKind, MaybePromise, ReadonlyJsonValue } from './types';
export interface DvsAuthorDisplayContext {
    readonly type: CapsuleKind;
    readonly floorid: number;
    readonly swipeid: number;
    readonly record: ReadonlyJsonValue | undefined;
    readonly signal: AbortSignal;
}
export interface DvsAuthorMountContext extends DvsAuthorDisplayContext {
    readonly prepared: unknown;
}
export interface DvsAuthorCapsuleDisplay {
    mount(container: HTMLElement, ctx: DvsAuthorMountContext): () => void;
}
export interface DvsAuthorDisplay {
    prepare?(ctx: DvsAuthorDisplayContext): MaybePromise<unknown>;
    readonly user?: DvsAuthorCapsuleDisplay;
    readonly ai?: DvsAuthorCapsuleDisplay;
}
