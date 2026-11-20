import type { DvsApi as TablesApi, DvsFloorData } from './ext/tables/contracts';
import type { UuidV7Api } from '../uuid-v7';
export * from './ext/tables/contracts';
export type * from './author-contracts';
export type { MemoryConfig, MemoryConfigPatch } from './ext/memory/contracts';
export type { ModelRequestDraft, ModelTask, UserTaskAvailability, ExtensionDependencies } from './types';
export type ExtensionKey = string;
export type ExtensionOverrides = Record<ExtensionKey, boolean>;
export interface DvsScriptConfig {
    enabled: boolean;
    exts?: ExtensionOverrides;
    config?: Record<ExtensionKey, Record<string, unknown>>;
}
export interface DvsConfigApi {
    getExtension(key: ExtensionKey): Promise<boolean>;
    setExtension(key: ExtensionKey, enabled: boolean): Promise<boolean>;
    getConfig(key: ExtensionKey): Promise<Record<string, unknown>>;
    setConfig(key: ExtensionKey, config: Record<string, unknown>): Promise<Record<string, unknown>>;
    getInject(): Promise<{
        filter: boolean;
        plot: boolean;
    }>;
    setInject(flags: {
        filter: boolean;
        plot: boolean;
    }): Promise<{
        filter: boolean;
        plot: boolean;
    }>;
}
/** Author-facing API; execution and UI internals are not part of the declaration package. */
export interface DvsApi extends TablesApi, DvsConfigApi, UuidV7Api {
    llm(type: 'pre' | 'post', messages: readonly {
        role: 'system' | 'user' | 'assistant';
        content: string;
    }[]): Promise<string>;
    regen(target?: {
        messageId: number;
        swipeId?: number;
    }): Promise<void>;
    readFloorData(target: {
        messageId: number;
        swipeId?: number;
    }): Promise<DvsFloorData>;
    stop(): void;
}
