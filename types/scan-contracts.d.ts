/** Extension-internal scan transport. Read requests never change files or management records. */
export type ScanRequest = {
    operation: 'records';
} | {
    operation: 'directory';
    charDbId?: string;
} | {
    operation: 'file';
    charDbId: string;
    chatDbId?: string;
};
export interface ScanTarget {
    scope: 'char' | 'chat';
    charDbId: string;
    chatDbId?: string;
    state: 'never' | 'creating' | 'ready';
}
export interface ScanRecord {
    scope: 'char' | 'chat';
    referenceId: number;
    parentReferenceId?: number;
    avatar: string;
    file?: string;
    id: string | null;
    parent?: string;
    state: 'active' | 'retained' | 'deleted';
    generation?: number;
    confirmed?: boolean;
    origin?: 'generated' | 'legacy';
    initialization?: ScanTarget['state'];
    taskReasons: string[];
    parentDependency: boolean;
    shared: boolean;
}
export interface ScanIssue {
    relativePath: string;
    reason: string;
}
export interface ScanSnapshot {
    schemaVersion?: number;
    directoryName: string;
    rootReadable: boolean;
    records: ScanRecord[];
    targets: ScanTarget[];
    issues: ScanIssue[];
}
export interface ScanFile {
    charDbId: string;
    chatDbId?: string;
    relativePath: string;
    status: 'exists' | 'missing' | 'unknown';
    size?: number;
    reason?: string;
}
export interface ScanDirectory {
    characters: string[];
    files: ScanFile[];
    issues: ScanIssue[];
}
export type ScanResult = ScanSnapshot | ScanDirectory | ScanFile;
export type ScanCategory = 'cleanable' | 'missing' | 'retained' | 'unknown';
export interface ScanClassification {
    category: ScanCategory;
    reason: string;
}
/** Classify only observed local facts; active records have not yet been checked in Tavern. */
export declare function classifyScanRecord(record: ScanRecord, file?: ScanFile): ScanClassification;
/** Permission is bounded by the concrete selection the user confirmed. */
export interface ScanCleanupRequest {
    operationId: string;
    expected: ScanRecord;
    removeRecord: boolean;
    removeFile: boolean;
    observation: {
        status: 'deleted' | 'same' | 'unknown';
        reason: string;
        observedId?: string | null;
    };
}
export interface ScanCleanupResult {
    scope: 'char' | 'chat';
    referenceId: number;
    partial: boolean;
    file: {
        status: 'removed' | 'missing' | 'shared' | 'retained' | 'none' | 'blocked';
        relativePath?: string;
        message: string;
    };
    record: {
        status: 'removed' | 'retained' | 'blocked';
        message: string;
    };
}
