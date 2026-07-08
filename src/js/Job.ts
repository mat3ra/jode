import { hasScopeTrackMixin } from "@mat3ra/code/dist/js/entity/mixins/HasScopeTrackMixin";
import { inMemoryEntityInSetMixin } from "@mat3ra/code/dist/js/entity/set/InMemoryEntityInSetMixin";
import { inMemoryEntitySetMixin } from "@mat3ra/code/dist/js/entity/set/InMemoryEntitySetMixin";
import { NamedInMemoryEntity } from "@mat3ra/code/dist/js/entity";
import { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import { computedEntityMixin } from "@mat3ra/ide/dist/js/compute";
import type { Material } from "@mat3ra/made";
import type WodeWorkflowType from "@mat3ra/wode/dist/js/Workflow";

import { defaultDataset } from "./dataset";
import { JOB_FINAL_STATUS_LIST, JobStatus } from "./enums";

// Static import for ESM compatibility (Vite/browser). Vite handles CJS→ESM
// interop for Workflow.js so the default export is the Workflow class.
import WodeWorkflowDefault from "@mat3ra/wode/dist/js/Workflow";
// Normalise: when bundled as CJS, __esModule interop may nest under .default.
const WodeWorkflow = ((WodeWorkflowDefault as any).default ??
    WodeWorkflowDefault) as typeof WodeWorkflowType;

/**
 * A minimal entity reference — contains at least an `_id` to identify the entity.
 */
export interface EntityReference {
    _id: string;
    [key: string]: unknown;
}

/**
 * Shape of the minimal workflow JSON needed by Job.
 */
export interface JobWorkflowSchema {
    name: string;
    subworkflows: unknown[];
    units: unknown[];
    workflows: unknown[];
    [key: string]: unknown;
}

/**
 * Core shape of a Job's JSON representation.
 * Intentionally lightweight — the webapp extends this via WebappJobSchema.
 */
export interface JobSchema {
    _id?: string;
    name?: string;
    status?: JobStatus;
    statusTrack?: Array<{ status: string; trackedAt: number }>;
    workflow?: JobWorkflowSchema;
    compute?: AnyObject;
    owner?: EntityReference;
    creator?: EntityReference;
    _project?: EntityReference;
    _material?: EntityReference;
    _materials?: EntityReference[];
    _materialsSet?: EntityReference;
    parent?: EntityReference;
    dataset?: typeof defaultDataset;
    isEntitySet?: boolean;
    [key: string]: unknown;
}

/**
 * Job — core non-visual model for a computational job.
 *
 * This class is Meteor-free and host-application-agnostic. It is designed for
 * use in standalone packages (jove, job-designer) as well as in the web-app,
 * where a host-level subclass may extend it with DAO, Meteor, and routing integrations.
 */
export class Job extends NamedInMemoryEntity {
    declare _json: JobSchema & AnyObject;

    _workflow?: WodeWorkflowType;

    constructor(config: JobSchema) {
        super({ ...(config as AnyObject), _materialsSet: config._materialsSet || undefined });

        this.dataset = this._json.dataset || defaultDataset;

        if (!this._json.isEntitySet) {
            this.initialize();
        }
    }

    /**
     * Initializes derived state (workflow instance, material references) from raw JSON.
     */
    initialize(): void {
        if (this._json.isEntitySet) return;

        if (this._json.workflow) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._workflow = new WodeWorkflow(this._json.workflow as any);
        }
    }

    setProps(json: AnyObject): this {
        super.setProps(json);

        if (!this._json.isEntitySet) {
            this.initialize();
        }

        return this;
    }

    toJSON(): JobSchema & AnyObject {
        return {
            ...(super.toJSON() as AnyObject),
            workflow: this._workflow?.toJSON(),
        };
    }

    /**
     * Renders the workflow with the given material context.
     * Only valid when the job has a workflow and at least one material.
     */
    render(): void {
        const material = this.material || this.materials?.[0];
        if (!material) {
            throw new Error("Job must have a material and materials");
        }
        if (!this._workflow) {
            throw new Error("Workflow not found");
        }
        // render() is typed against OrderedMaterial in wode; we cast to any for flexibility.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this._workflow as any).render({
            material,
            materials: this.materials || [material],
            materialsSet: this.materialsSet,
            jobHasParent: Boolean(this.parent),
        });
    }

    // ─── Status ─────────────────────────────────────────────────────────────────

    /**
     * Returns the job status, defaulting to `pre_submission` if not set.
     */
    get status(): JobStatus {
        return this.prop<JobStatus>("status") || JobStatus.pre_submission;
    }

    get statusCls(): string {
        const colors: Record<string, string> = {
            [JobStatus.queued]: "info",
            [JobStatus.submitted]: "primary",
            [JobStatus.active]: "warning",
            [JobStatus.finished]: "success",
            [JobStatus.error]: "error",
        };
        return colors[this.status] || "default";
    }

    /**
     * Returns true when the job has a terminal status (finished/error/terminated/timeout).
     */
    get isInFinalStatus(): boolean {
        return JOB_FINAL_STATUS_LIST.includes(this.status);
    }

    get isSubmitted(): boolean {
        return this.status === JobStatus.submitted;
    }

    get isActive(): boolean {
        return this.status === JobStatus.active;
    }

    get isError(): boolean {
        return this.status === JobStatus.error;
    }

    get isInInitialStatus(): boolean {
        return this.status === JobStatus.pre_submission;
    }

    get isInRunningStatus(): boolean {
        return [JobStatus.active, JobStatus.submitted].includes(this.status);
    }

    // ─── Status Track ────────────────────────────────────────────────────────────

    get statusTrack(): Array<{ status: string; trackedAt: number }> {
        return this.prop<Array<{ status: string; trackedAt: number }>>("statusTrack", []);
    }

    /** Status track items in chronological order. */
    get statusTrackSorted(): Array<{ status: string; trackedAt: number }> {
        return [...this.statusTrack].sort((a, b) => a.trackedAt - b.trackedAt);
    }

    get submittedTimestamp(): { status: string; trackedAt: number } | undefined {
        return this.statusTrack.find((s) => s.status === JobStatus.submitted);
    }

    get activeTimestamp(): { status: string; trackedAt: number } | undefined {
        return this.statusTrack.find((s) => s.status === JobStatus.active);
    }

    get finalTimestamp(): { status: string; trackedAt: number } | undefined {
        return JOB_FINAL_STATUS_LIST.reduce(
            (result: { status: string; trackedAt: number } | undefined, status) => {
                if (result) return result;
                return this.statusTrack.find((s) => s.status === status);
            },
            undefined,
        );
    }

    get hasBeenActiveMoreThanOnce(): boolean {
        return Boolean(
            this.statusTrack
                .map((o) => o.status)
                .filter((s) => s === JobStatus.active).length > 1,
        );
    }

    // ─── Material ────────────────────────────────────────────────────────────────

    /**
     * Sets the primary material for this job.
     */
    setMaterial(material: Material): void {
        this.setProp("material", material);
        const reference = (
            material as unknown as { getAsEntityReference?: () => EntityReference }
        ).getAsEntityReference?.();
        if (reference) {
            this._json._material = reference;
        }
    }

    /**
     * Sets multiple materials for a multi-material job.
     */
    setMaterials(materials: Material[] = []): void {
        this.setProp("materials", materials);
        const references = materials.map(
            (m) =>
                (
                    m as unknown as { getAsEntityReference?: () => EntityReference }
                ).getAsEntityReference?.() ??
                ({ _id: (m as unknown as { _id?: string })._id ?? "" } as EntityReference),
        );
        this._json._materials = references;
    }

    get material(): Material | undefined {
        return this.prop<Material>("material");
    }

    get materials(): Material[] | undefined {
        return this.prop<Material[]>("materials");
    }

    get _material(): EntityReference | undefined {
        return this.prop<EntityReference>("_material");
    }

    get _materials(): EntityReference[] | undefined {
        return this.prop<EntityReference[]>("_materials");
    }

    setMaterialsSet(materialsSet: EntityReference | undefined): void {
        this.setProp("_materialsSet", materialsSet || undefined);
    }

    get materialsSet(): EntityReference | undefined {
        return this.prop<EntityReference>("_materialsSet");
    }

    // ─── Dataset ────────────────────────────────────────────────────────────────

    get dataset(): typeof defaultDataset {
        return this.prop<typeof defaultDataset>("dataset", defaultDataset);
    }

    set dataset(value: typeof defaultDataset) {
        this.setProp("dataset", value);
    }

    // ─── Workflow ────────────────────────────────────────────────────────────────

    get workflow(): WodeWorkflowType {
        if (!this._workflow) {
            throw new Error("Workflow not found");
        }
        return this._workflow;
    }

    setWorkflow(workflow: WodeWorkflowType): void {
        this._workflow = workflow;
        this._json.workflow = this._workflow.toJSON() as unknown as JobWorkflowSchema;
    }

    get usedApplicationNames(): string[] {
        return this.workflow.usedApplicationNames;
    }

    // ─── Project / Parent ────────────────────────────────────────────────────────

    get _project(): EntityReference | undefined {
        return this.prop<EntityReference>("_project");
    }

    setParent(parentJob: Job): void {
        const reference = (
            parentJob as unknown as { getAsEntityReference?: () => EntityReference }
        ).getAsEntityReference?.();
        if (reference) {
            this._json.parent = reference;
        }
    }

    unsetParent(): void {
        delete this._json.parent;
    }

    get parent(): EntityReference | undefined {
        return this.prop<EntityReference>("parent");
    }

    // ─── Factory ─────────────────────────────────────────────────────────────────

    /**
     * Creates a new Job with sensible defaults for a given workflow and material.
     */
    static createDefault(
        workflow: WodeWorkflowType,
        material: Material | Material[],
        extraConfig: Partial<JobSchema> = {},
    ): Job {
        const singleMaterial = Array.isArray(material) ? material[0] : material;
        const job = new Job({
            name: "New Job",
            status: JobStatus.pre_submission,
            statusTrack: [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            workflow: workflow._json as any,
            dataset: defaultDataset,
            ...extraConfig,
        });

        if (workflow.isMultiMaterial) {
            job.setMaterials(Array.isArray(material) ? material : [material]);
        } else {
            job.setMaterial(singleMaterial);
        }

        return job;
    }
}

hasScopeTrackMixin(Job.prototype);
inMemoryEntityInSetMixin(Job.prototype);
inMemoryEntitySetMixin(Job.prototype);
computedEntityMixin(Job.prototype);

export default Job;
