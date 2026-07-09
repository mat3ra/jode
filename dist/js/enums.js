"use strict";
/**
 * Job status enum and related helpers.
 * This module has NO external dependencies — it is safe to import anywhere.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAB_NAVIGATION_CONFIG = exports.SINGLE_JOB_SUFFIX = exports.JOB_MODES = exports.JOB_FINAL_STATUS_LIST = exports.JobStatus = exports.JOB_STATUSES = void 0;
exports.JOB_STATUS_CLS = JOB_STATUS_CLS;
exports.JOB_STATUSES = {
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
var JobStatus;
(function (JobStatus) {
    JobStatus["pre_submission"] = "pre-submission";
    JobStatus["queued"] = "queued";
    JobStatus["submitted"] = "submitted";
    JobStatus["active"] = "active";
    JobStatus["finished"] = "finished";
    JobStatus["terminate_queued"] = "terminate-queued";
    JobStatus["terminated"] = "terminated";
    JobStatus["error"] = "error";
    JobStatus["deleted"] = "deleted";
    JobStatus["timeout"] = "timeout";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
exports.JOB_FINAL_STATUS_LIST = [
    JobStatus.finished,
    JobStatus.error,
    JobStatus.terminated,
    JobStatus.timeout,
];
function JOB_STATUS_CLS(status) {
    if (!status) {
        return "default";
    }
    const colors = {
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
exports.JOB_MODES = {
    normal: "normal",
    parse_only: "parse-only",
};
exports.SINGLE_JOB_SUFFIX = "{{ material.formula }}";
exports.TAB_NAVIGATION_CONFIG = {
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
