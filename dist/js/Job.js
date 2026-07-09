"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const entity_1 = require("@mat3ra/code/dist/js/entity");
const DefaultableMixin_1 = require("@mat3ra/code/dist/js/entity/mixins/DefaultableMixin");
const HasDescriptionMixin_1 = require("@mat3ra/code/dist/js/entity/mixins/HasDescriptionMixin");
const HashedEntityMixin_1 = require("@mat3ra/code/dist/js/entity/mixins/HashedEntityMixin");
const NamedEntityMixin_1 = require("@mat3ra/code/dist/js/entity/mixins/NamedEntityMixin");
const TaggableMixin_1 = require("@mat3ra/code/dist/js/entity/mixins/TaggableMixin");
const compute_1 = require("@mat3ra/ide/dist/js/compute");
const dataset_1 = require("./dataset");
const enums_1 = require("./enums");
const JobSchemaMixin_1 = require("./generated/JobSchemaMixin");
// Static import for ESM compatibility (Vite/browser). Vite handles CJS→ESM
// interop for Workflow.js so the default export is the Workflow class.
const Workflow_1 = __importDefault(require("@mat3ra/wode/dist/js/Workflow"));
// Normalise: when bundled as CJS, __esModule interop may nest under .default.
const WodeWorkflow = ((_a = Workflow_1.default.default) !== null && _a !== void 0 ? _a : Workflow_1.default);
/**
 * Job — core non-visual model for a computational job.
 *
 * This class is host-application-agnostic. It is designed for use in
 * standalone packages (jove, job-designer) as well as in the web-app,
 * where a host-level subclass may extend it with persistence and routing.
 */
class Job extends entity_1.InMemoryEntity {
    constructor(config) {
        super({ ...config, _materialsSet: config._materialsSet || undefined });
        this._json.dataset = this._json.dataset || dataset_1.defaultDataset;
        if (!this._json.isEntitySet) {
            this.initialize();
        }
    }
    /**
     * Initializes derived state (workflow instance, material references) from raw JSON.
     */
    initialize() {
        if (this._json.isEntitySet)
            return;
        if (this._json.workflow) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._workflow = new WodeWorkflow(this._json.workflow);
        }
    }
    setProps(json) {
        super.setProps(json);
        if (!this._json.isEntitySet) {
            this.initialize();
        }
        return this;
    }
    toJSON() {
        var _a;
        return {
            ...super.toJSON(),
            workflow: (_a = this._workflow) === null || _a === void 0 ? void 0 : _a.toJSON(),
        };
    }
    /**
     * Renders the workflow with the given material context.
     * Only valid when the job has a workflow and at least one material.
     */
    render() {
        var _a;
        const material = this.material || ((_a = this.materials) === null || _a === void 0 ? void 0 : _a[0]);
        if (!material) {
            throw new Error("Job must have a material and materials");
        }
        if (!this._workflow) {
            throw new Error("Workflow not found");
        }
        // render() is typed against OrderedMaterial in wode; we cast to any for flexibility.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._workflow.render({
            material,
            materials: this.materials || [material],
            materialsSet: this.materialsSet,
            jobHasParent: Boolean(this.parent),
        });
    }
    // ─── Status Helpers ─────────────────────────────────────────────────────────
    get statusCls() {
        var _a;
        const colors = {
            [enums_1.JobStatus.queued]: "info",
            [enums_1.JobStatus.submitted]: "primary",
            [enums_1.JobStatus.active]: "warning",
            [enums_1.JobStatus.finished]: "success",
            [enums_1.JobStatus.error]: "error",
        };
        return colors[(_a = this.status) !== null && _a !== void 0 ? _a : ""] || "default";
    }
    /**
     * Returns true when the job has a terminal status (finished/error/terminated/timeout).
     */
    get isInFinalStatus() {
        return enums_1.JOB_FINAL_STATUS_LIST.includes(this.status);
    }
    get isSubmitted() {
        return this.status === enums_1.JobStatus.submitted;
    }
    get isActive() {
        return this.status === enums_1.JobStatus.active;
    }
    get isError() {
        return this.status === enums_1.JobStatus.error;
    }
    get isInInitialStatus() {
        return this.status === enums_1.JobStatus.pre_submission;
    }
    get isInRunningStatus() {
        return [enums_1.JobStatus.active, enums_1.JobStatus.submitted].includes(this.status);
    }
    // ─── Status Track ────────────────────────────────────────────────────────────
    get statusTrack() {
        return this.prop("statusTrack", []);
    }
    /** Status track items in chronological order. */
    get statusTrackSorted() {
        return [...this.statusTrack].sort((a, b) => a.trackedAt - b.trackedAt);
    }
    get submittedTimestamp() {
        return this.statusTrack.find((s) => s.status === enums_1.JobStatus.submitted);
    }
    get activeTimestamp() {
        return this.statusTrack.find((s) => s.status === enums_1.JobStatus.active);
    }
    get finalTimestamp() {
        return enums_1.JOB_FINAL_STATUS_LIST.reduce((result, status) => {
            if (result)
                return result;
            return this.statusTrack.find((s) => s.status === status);
        }, undefined);
    }
    get hasBeenActiveMoreThanOnce() {
        return Boolean(this.statusTrack
            .map((o) => o.status)
            .filter((s) => s === enums_1.JobStatus.active).length > 1);
    }
    // ─── Material ────────────────────────────────────────────────────────────────
    /**
     * Sets the primary material for this job.
     */
    setMaterial(material) {
        var _a, _b;
        this.setProp("material", material);
        const reference = (_b = (_a = material).getAsEntityReference) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (reference) {
            this._json._material = reference;
        }
    }
    /**
     * Sets multiple materials for a multi-material job.
     */
    setMaterials(materials = []) {
        this.setProp("materials", materials);
        const references = materials.map((m) => {
            var _a, _b, _c, _d;
            return (_c = (_b = (_a = m).getAsEntityReference) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : { _id: (_d = m._id) !== null && _d !== void 0 ? _d : "" };
        });
        this._json._materials = references;
    }
    get material() {
        return this.prop("material");
    }
    get materials() {
        return this.prop("materials");
    }
    setMaterialsSet(materialsSet) {
        this.setProp("_materialsSet", materialsSet || undefined);
    }
    get materialsSet() {
        return this.prop("_materialsSet");
    }
    // ─── Workflow ────────────────────────────────────────────────────────────────
    get workflowInstance() {
        if (!this._workflow) {
            throw new Error("Workflow not found");
        }
        return this._workflow;
    }
    setWorkflow(workflowInstance) {
        this._workflow = workflowInstance;
        this._json.workflow = this._workflow.toJSON();
    }
    get usedApplicationNames() {
        return this.workflowInstance.usedApplicationNames;
    }
    // ─── Parent ─────────────────────────────────────────────────────────────────
    setParent(parentJob) {
        var _a, _b;
        const reference = (_b = (_a = parentJob).getAsEntityReference) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (reference) {
            this._json.parent = reference;
        }
    }
    unsetParent() {
        delete this._json.parent;
    }
    // ─── Factory ─────────────────────────────────────────────────────────────────
    /**
     * Creates a new Job with sensible defaults for a given workflow and material.
     */
    static createFromWorkflow(workflow, material, extraConfig = {}) {
        const singleMaterial = Array.isArray(material) ? material[0] : material;
        const job = new Job({
            name: "New Job",
            status: enums_1.JobStatus.pre_submission,
            statusTrack: [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            workflow: workflow._json,
            dataset: dataset_1.defaultDataset,
            ...extraConfig,
        });
        if (workflow.isMultiMaterial) {
            job.setMaterials(Array.isArray(material) ? material : [material]);
        }
        else {
            job.setMaterial(singleMaterial);
        }
        return job;
    }
}
exports.Job = Job;
(0, NamedEntityMixin_1.namedEntityMixin)(Job.prototype);
(0, JobSchemaMixin_1.jobSchemaMixin)(Job.prototype);
(0, TaggableMixin_1.taggableMixin)(Job.prototype);
(0, compute_1.computedEntityMixin)(Job.prototype);
(0, DefaultableMixin_1.defaultableEntityMixin)(Job);
(0, HashedEntityMixin_1.hashedEntityMixin)(Job.prototype);
(0, HasDescriptionMixin_1.hasDescriptionMixin)(Job.prototype);
exports.default = Job;
