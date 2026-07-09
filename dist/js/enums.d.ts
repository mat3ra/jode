/**
 * Job status enum and related helpers.
 * This module has NO external dependencies — it is safe to import anywhere.
 */
export declare const JOB_STATUSES: {
    pre_submission: string;
    queued: string;
    submitted: string;
    active: string;
    finished: string;
    terminate_queued: string;
    terminated: string;
    error: string;
    deleted: string;
    timeout: string;
};
export declare enum JobStatus {
    pre_submission = "pre-submission",
    queued = "queued",
    submitted = "submitted",
    active = "active",
    finished = "finished",
    terminate_queued = "terminate-queued",
    terminated = "terminated",
    error = "error",
    deleted = "deleted",
    timeout = "timeout"
}
export declare const JOB_FINAL_STATUS_LIST: JobStatus[];
export declare function JOB_STATUS_CLS(status?: JobStatus): string;
export declare const JOB_MODES: {
    normal: string;
    parse_only: string;
};
export declare const SINGLE_JOB_SUFFIX = "{{ material.formula }}";
export declare const TAB_NAVIGATION_CONFIG: {
    material: {
        id: string;
        itemName: string;
        className: string;
    };
    dataset: {
        id: string;
        itemName: string;
        className: string;
    };
    workflow: {
        id: string;
        itemName: string;
        className: string;
    };
    compute: {
        id: string;
        itemName: string;
        className: string;
    };
    results: {
        id: string;
        itemName: string;
        className: string;
    };
    files: {
        id: string;
        itemName: string;
        className: string;
    };
};
