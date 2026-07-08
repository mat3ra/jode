/**
 * Job status enum and related helpers.
 * This module has NO external dependencies — it is safe to import anywhere.
 */

export const JOB_STATUSES = {
    pre_submission: "pre-submission",
    queued: "queued",
    submitted: "submitted",
    active: "active",
    finished: "finished",
    terminate_queued: "terminate-queued",
    terminated: "terminated",
    error: "error",
    deleted: "deleted",
    timeout: "timeout",
};

export enum JobStatus {
    pre_submission = "pre-submission",
    queued = "queued",
    submitted = "submitted",
    active = "active",
    finished = "finished",
    terminate_queued = "terminate-queued",
    terminated = "terminated",
    error = "error",
    deleted = "deleted",
    timeout = "timeout",
}

export const JOB_FINAL_STATUS_LIST = [
    JobStatus.finished,
    JobStatus.error,
    JobStatus.terminated,
    JobStatus.timeout,
];

export function JOB_STATUS_CLS(status?: JobStatus): string {
    if (!status) {
        return "default";
    }
    const colors: Partial<Record<JobStatus, string>> = {
        [JobStatus.pre_submission]: "info",
        [JobStatus.queued]: "info",
        [JobStatus.submitted]: "primary",
        [JobStatus.active]: "warning",
        [JobStatus.finished]: "success",
        [JobStatus.terminate_queued]: "default",
        [JobStatus.terminated]: "default",
        [JobStatus.timeout]: "default",
        [JobStatus.error]: "error",
        [JobStatus.deleted]: "default",
    };
    return colors[status] || "default";
}


export const JOB_MODES = {
    normal: "normal",
    parse_only: "parse-only",
};

export const SINGLE_JOB_SUFFIX = "{{ material.formula }}";

export const TAB_NAVIGATION_CONFIG = {
    material: {
        id: "material",
        itemName: "1. Materials",
        className: "",
    },
    dataset: {
        id: "dataset",
        itemName: "1. Dataset",
        className: "",
    },
    workflow: {
        id: "workflow",
        itemName: "2. Workflow",
        className: "",
    },
    compute: {
        id: "compute",
        itemName: "3. Compute",
        className: "",
    },
    results: {
        id: "results",
        itemName: "4. Results",
        className: "",
    },
    files: {
        id: "files",
        itemName: "5. Files",
        className: "",
    },
};
