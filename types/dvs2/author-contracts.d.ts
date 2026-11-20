import type { ExtensionControllerDefinition, ExtensionDefinition, ExtensionHelper, CapsuleKind, ReadonlyJsonValue, MaybePromise, StageName, StageContext as RuntimeContext, StageHelper, ModelRequestDraft, UserTaskAvailability } from './types';
import type { DvsAuthorDisplay } from './author-display';
export type { DvsAuthorDisplayContext, DvsAuthorMountContext, DvsAuthorCapsuleDisplay, DvsAuthorDisplay, } from './author-display';
export type DvsOptionalBuiltin = 'plot_plan' | 'tables_opt' | 'pre_narr_ui' | 'memory';
export type DvsBuiltin = DvsOptionalBuiltin | 'tables' | 'lb_opt' | 'dvs_pre' | 'dvs_post_update';
export type DvsAuthorHelper = ExtensionHelper;
export type { DvsAuthorEjs, DvsAuthorTemplateContext, DvsMacro } from './author-templates';
export type StageContext<S extends StageName, C = unknown> = Omit<RuntimeContext<S, C>, 'helper'> & {
    readonly helper: Pick<StageHelper, 'signal' | 'assertCurrent' | 'readLorebook' | 'char' | 'chat'>;
};
export interface DvsAuthorController {
    collectPre?(ctx: StageContext<'collect'>): MaybePromise<void>;
    collectPost?(ctx: StageContext<'collect'>, availability: UserTaskAvailability): MaybePromise<void>;
    userReqPre?(ctx: StageContext<'userReq'>, request: ModelRequestDraft): MaybePromise<void>;
    userRespPost?(ctx: StageContext<'userResp'>, data: unknown): MaybePromise<void>;
    aiReqPre?(ctx: StageContext<'aiReq'>, request: ModelRequestDraft): MaybePromise<void>;
    aiRespPost?(ctx: StageContext<'aiResp'>, data: unknown): MaybePromise<void>;
}
export interface DvsAuthorExtension extends Pick<ExtensionDefinition, 'key' | 'default_config' | 'dvsTableOptions' | 'migrations'> {
    readonly display?: DvsAuthorDisplay;
    readonly ejs?: import('./author-templates').DvsAuthorEjs;
    readonly controller?: Pick<ExtensionControllerDefinition, 'dependencies' | 'allowFailure'> & {
        new (helper: DvsAuthorHelper): DvsAuthorController;
        summarize?(type: CapsuleKind, data: ReadonlyJsonValue): string | undefined;
    };
}
