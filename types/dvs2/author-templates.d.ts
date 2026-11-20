import type { DvsTemplateState } from './ext/tables/contracts';
import type { ExtensionDefinition, StageExchange } from './types';
export type DvsMacro = string | ((...args: string[]) => string);
export interface DvsAuthorTemplateContext {
    readonly floorid: number | null;
    readonly swipeid: number | null;
    readonly state: DvsTemplateState | null;
}
export type DvsAuthorEjs = Readonly<Record<string, (ctx: DvsAuthorTemplateContext, ...args: any[]) => unknown>>;
export declare function createAuthorEjs(definitions: readonly ExtensionDefinition[], target: {
    floorid: number;
    swipeid: number;
} | undefined, state: () => DvsTemplateState | undefined): Record<string, Record<string, unknown>>;
export declare function setTemplateEjs(exchange: StageExchange, definition: ExtensionDefinition, name: string, value: unknown): void;
export declare function setTemplateMacro(exchange: StageExchange, key: string, name: string, value: DvsMacro): void;
export declare function expandAuthorMacros(text: string, macros: StageExchange['macros']): string;
export declare function snapshotTemplates(exchange: StageExchange): () => void;
