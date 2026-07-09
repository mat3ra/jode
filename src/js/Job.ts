import { type NamedInMemoryEntity, InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import {
    type Defaultable,
    defaultableEntityMixin,
} from "@mat3ra/code/dist/js/entity/mixins/DefaultableMixin";
import {
    type HasDescription,
    hasDescriptionMixin,
} from "@mat3ra/code/dist/js/entity/mixins/HasDescriptionMixin";
import {
    type HashedEntity,
    hashedEntityMixin,
} from "@mat3ra/code/dist/js/entity/mixins/HashedEntityMixin";
import { namedEntityMixin } from "@mat3ra/code/dist/js/entity/mixins/NamedEntityMixin";
import { Taggable, taggableMixin } from "@mat3ra/code/dist/js/entity/mixins/TaggableMixin";
import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type {
    JobSchema as EsseJobSchema,
    ExtendedJobSchema,
} from "@mat3ra/esse/dist/js/types";
import { ComputedEntityMixin, computedEntityMixin } from "@mat3ra/ide/dist/js/compute";
import type { Material } from "@mat3ra/made";
import type WodeWorkflowType from "@mat3ra/wode/dist/js/Workflow";

import { defaultDataset } from "./dataset";
import { JOB_FINAL_STATUS_LIST, JobStatus } from "./enums";
import { type JobSchemaMixin, jobSchemaMixin } from "./generated/JobSchemaMixin";

// Static import for ESM compatibility (Vite/browser). Vite handles CJS→ESM
// interop for Workflow.js so the default export is the Workflow class.
import WodeWorkflowDefault from "@mat3ra/wode/dist/js/Workflow";
// Normalise: when bundled as CJS, __esModule interop may nest under .default.
const WodeWorkflow = ((WodeWorkflowDefault as any).default ??
    WodeWorkflowDefault) as typeof WodeWorkflowType;

/**
 * Combined Job schema type from ESSE base + extended schemas.
 * Uses Partial because not all fields are present at construction time.
 */
export type JobSchema = Partial<EsseJobSchema> & Partial<ExtendedJobSchema> & AnyObject;

/**
 * A minimal entity reference — contains at least an `_id` to identify the entity.
 */
export interface EntityReference {
    _id: string;
    [key: string]: unknown;
}

interface Job
    extends Defaultable,
        NamedInMemoryEntity,
        JobSchemaMixin,
        Taggable,
        HashedEntity,
        ComputedEntityMixin,
        HasDescription {
    // TODO: fix ComputedEntityMixin and remove this
    compute: EsseJobSchema["compute"];
}

/**
 * Job — core non-visual model for a computational job.
 *
 * This class is host-application-agnostic. It is designed for use in
 * standalone packages (jove, job-designer) as well as in the web-app,
 * where a host-level subclass may extend it with persistence and routing.
 */
class Job extends InMemoryEntity {
    declare _json: JobSchema & AnyObject;

    _workflow?: WodeWorkflowType;

    constructor(config: JobSchema) {
        super({ ...(config as AnyObject), _materialsSet: config._materialsSet || undefined });

        this._json.dataset = this._json.dataset || defaultDataset;

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

    // ─── Status Helpers ─────────────────────────────────────────────────────────

    get statusCls(): string {
        const colors: Record<string, string> = {
            [JobStatus.queued]: "info",
            [JobStatus.submitted]: "primary",
            [JobStatus.active]: "warning",
            [JobStatus.finished]: "success",
            [JobStatus.error]: "error",
        };
        return colors[this.status ?? ""] || "default";
    }

    /**
     * Returns true when the job has a terminal status (finished/error/terminated/timeout).
     */
    get isInFinalStatus(): boolean {
        return JOB_FINAL_STATUS_LIST.includes(this.status as JobStatus);
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
        return [JobStatus.active, JobStatus.submitted].includes(this.status as JobStatus);
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

    setMaterialsSet(materialsSet: EntityReference | undefined): void {
        this.setProp("_materialsSet", materialsSet || undefined);
    }

    get materialsSet(): EntityReference | undefined {
        return this.prop<EntityReference>("_materialsSet");
    }

    // ─── Workflow ────────────────────────────────────────────────────────────────

    get workflowInstance(): WodeWorkflowType {
        if (!this._workflow) {
            throw new Error("Workflow not found");
        }
        return this._workflow;
    }

    setWorkflow(workflowInstance: WodeWorkflowType): void {
        this._workflow = workflowInstance;
        this._json.workflow = this._workflow.toJSON() as unknown as JobSchema["workflow"];
    }

    get usedApplicationNames(): string[] {
        return this.workflowInstance.usedApplicationNames;
    }

    // ─── Parent ─────────────────────────────────────────────────────────────────

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

    // ─── Factory ─────────────────────────────────────────────────────────────────

    /**
     * Creates a new Job with sensible defaults for a given workflow and material.
     */
    static createFromWorkflow(
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

namedEntityMixin(Job.prototype);
jobSchemaMixin(Job.prototype);
taggableMixin(Job.prototype);
computedEntityMixin(Job.prototype);
defaultableEntityMixin(Job);
hashedEntityMixin(Job.prototype);
hasDescriptionMixin(Job.prototype);

export { Job };
export default Job;
