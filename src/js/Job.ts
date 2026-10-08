import { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
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
import {
    type NamedEntity,
    namedEntityMixin,
} from "@mat3ra/code/dist/js/entity/mixins/NamedEntityMixin";
import { Taggable, taggableMixin } from "@mat3ra/code/dist/js/entity/mixins/TaggableMixin";
import type { JobSchema as EsseJobSchema } from "@mat3ra/esse/dist/js/types";
import { ComputedEntityMixin, computedEntityMixin } from "@mat3ra/ide/dist/js/compute";
import type { OrderedMaterial } from "@mat3ra/wode";
import WodeWorkflow from "@mat3ra/wode/dist/js/Workflow";
import type { WorkflowSchema } from "@mat3ra/wode/dist/js/workflows/types";

import { defaultDataset } from "./dataset";
import { JOB_FINAL_STATUS_LIST, JobStatus, SINGLE_JOB_SUFFIX } from "./enums";
import {
    type HasProjectSchemaMixin,
    hasProjectSchemaMixin,
} from "./generated/HasProjectSchemaMixin";
import { type JobSchemaMixin, jobSchemaMixin } from "./generated/JobSchemaMixin";

/**
 * A minimal entity reference — contains at least an `_id` to identify the entity.
 */
export interface EntityReference {
    _id: string;
    [key: string]: unknown;
}

/**
 * `workflow` is inlined by json-schema-to-typescript with a loose shape - the schema's own
 * recursive `workflow.workflows` field (sub-workflows share the parent's schema) resolves to a
 * bare `{ type: "object" }` with no properties, so the generated type is `{}[]`. wode's own
 * `WorkflowSchema` expresses the real recursive structure, so it replaces the generated one here.
 */
export type JobEntity = Omit<EsseJobSchema, "workflow"> & { workflow: WorkflowSchema };

interface Job
    extends Defaultable,
        NamedEntity,
        JobSchemaMixin,
        HasProjectSchemaMixin,
        Taggable,
        HashedEntity,
        ComputedEntityMixin<EsseJobSchema["compute"]>,
        HasDescription {}

/**
 * Job — core non-visual model for a computational job.
 *
 * This class is host-application-agnostic. It is designed for use in
 * standalone packages (jove, job-designer) as well as in the web-app,
 * where a host-level subclass may extend it with persistence and routing.
 */
class Job<S extends JobEntity = JobEntity> extends InMemoryEntity<S> implements JobEntity {
    _workflow?: WodeWorkflow;

    /** Live material instance(s) - not part of the esse schema, never in `_json`/`toJSON`. */
    material?: OrderedMaterial;

    materials?: OrderedMaterial[];

    constructor(config: NoInfer<S>) {
        super({ ...config, _materialsSet: config._materialsSet || undefined });

        this.dataset = this.dataset || defaultDataset;
        this.initialize();
    }

    /**
     * Raw workflow JSON. Hand-written (not part of the generated `jobSchemaMixin`) because the
     * schema's own recursive `workflow.workflows` field resolves to a lossy `{}[]` - see
     * `JobEntity`'s own doc comment. Fixed to wode's `WorkflowSchema` rather than generic over
     * `S`, matching wode's own `Workflow.workflows` (also hand-written, also fixed).
     */
    get workflow() {
        return this.requiredProp("workflow");
    }

    set workflow(value: WorkflowSchema) {
        // `setProp`'s signature (`value: S[typeof name]`) isn't call-site generic, so it widens
        // to `S[keyof S]` here rather than narrowing to `S["workflow"]` - same gap wode's own
        // `Workflow.workflows` setter works around the same way.
        (this._json as JobEntity).workflow = value;
    }

    /**
     * Initializes derived state (workflow instance, material references) from raw JSON.
     */
    initialize(): void {
        // Optional read (not `this.workflow`, which throws via requiredProp): a job may be
        // constructed without a workflow yet (e.g. before it's assigned via setWorkflow).
        const workflow = this.prop("workflow");
        if (workflow) {
            this._workflow = new WodeWorkflow(workflow);
        }
    }

    setProps(json: Partial<S>): this {
        super.setProps(json);
        this.initialize();

        return this;
    }

    toJSON(): S {
        return {
            ...super.toJSON(),
            workflow: this._workflow?.toJSON(),
        };
    }

    /**
     * Renders the workflow with the given material context.
     * Only valid when the job has a workflow and at least one material.
     */
    render(scopeGlobal?: Record<string, unknown>): void {
        const material = this.material || this.materials?.[0];
        if (!material) {
            throw new Error("Job must have a material and materials");
        }
        if (!this._workflow) {
            throw new Error("Workflow not found");
        }
        this._workflow.render({
            material,
            materials: this.materials || [material],
            materialsSet: this.materialsSet,
            jobHasParent: Boolean(this.parent),
            scopeGlobal,
        });
    }

    /**
     * Updates the job name to append or remove the per-material jinja suffix based on
     * whether the job is multi-material and how many materials are selected.
     */
    setNameBasedOnMaterials(materials: OrderedMaterial[]): void {
        const isMultiMaterial = Boolean(this._workflow?.isMultiMaterial);
        const hasMultipleMaterials = materials.length > 1;

        /**
         * Matches Jinja template expressions like:
         *   {{object.property}}, {{object[index].property}}, {{object.property[index].subproperty}}
         */
        const hasJinjaPattern = (this.name ?? "").match(
            /\{\{\s*\w+(\[\d+\]|\.\w+)*(\[\d+\])*\.\w+\s*\}\}/g,
        );

        if (!isMultiMaterial && hasMultipleMaterials && !hasJinjaPattern) {
            this.setName(`${this.name} ${SINGLE_JOB_SUFFIX}`);
        } else if (
            (isMultiMaterial && hasJinjaPattern) ||
            (!hasMultipleMaterials && hasJinjaPattern)
        ) {
            this.setName((this.name ?? "").replace(SINGLE_JOB_SUFFIX, "").replace(/\s*$/, ""));
        }
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
        return colors[this.status] || "default";
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
    // `statusTrack` itself is provided by the generated `jobSchemaMixin`.

    /** Status track items in chronological order. */
    get statusTrackSorted() {
        return [...(this.statusTrack ?? [])].sort((a, b) => a.trackedAt - b.trackedAt);
    }

    get submittedTimestamp() {
        return this.statusTrack?.find((s) => s.status === JobStatus.submitted);
    }

    get activeTimestamp() {
        return this.statusTrack?.find((s) => s.status === JobStatus.active);
    }

    get finalTimestamp() {
        return JOB_FINAL_STATUS_LIST.reduce<
            NonNullable<typeof this.statusTrack>[number] | undefined
        >(
            (result, status) => result ?? this.statusTrack?.find((s) => s.status === status),
            undefined,
        );
    }

    get hasBeenActiveMoreThanOnce(): boolean {
        return Boolean(
            (this.statusTrack ?? []).map((o) => o.status).filter((s) => s === JobStatus.active)
                .length > 1,
        );
    }

    // ─── Material ────────────────────────────────────────────────────────────────

    /**
     * Sets the primary material for this job.
     */
    setMaterial(material: OrderedMaterial): void {
        this.material = material;
        this._material = material.getAsEntityReference();
    }

    /**
     * Sets multiple materials for a multi-material job.
     */
    setMaterials(materials: OrderedMaterial[] = []): void {
        this.materials = materials;
        this._materials = materials.map((m) => m.getAsEntityReference());
    }

    setMaterialsSet(materialsSet: EntityReference | undefined): void {
        this._materialsSet = materialsSet || undefined;
    }

    get materialsSet(): EntityReference | undefined {
        return this.prop("_materialsSet");
    }

    // ─── Workflow ────────────────────────────────────────────────────────────────

    get workflowInstance(): WodeWorkflow {
        if (!this._workflow) {
            throw new Error("Workflow not found");
        }
        return this._workflow;
    }

    setWorkflow(workflowInstance: WodeWorkflow): void {
        this._workflow = workflowInstance;
        // Write straight to `_json`, not `this.workflow = ...` - a host subclass (e.g. web-app's
        // `CoreJob`) may shadow the `workflow` accessor to mean the live instance, which would
        // route this assignment back through `setWorkflow` and corrupt `_workflow`.
        (this._json as JobEntity).workflow = this._workflow.toJSON();
    }

    get usedApplicationNames(): string[] {
        return this.workflowInstance.usedApplicationNames;
    }

    // ─── Parent ─────────────────────────────────────────────────────────────────

    setParent(parentJob: Job): void {
        this.parent = parentJob.getAsEntityReference();
    }

    unsetParent(): void {
        this.unsetProp("parent");
    }

    // ─── Factory ─────────────────────────────────────────────────────────────────

    /**
     * Creates a new Job with sensible defaults for a given workflow and material.
     * `extraConfig` is expected to supply the remaining required fields (`_project`,
     * `compute`) that this host-agnostic factory cannot default on its own.
     */
    static createFromWorkflow(
        workflow: WodeWorkflow,
        material: OrderedMaterial | OrderedMaterial[],
        extraConfig: Partial<JobEntity> = {},
    ): Job {
        const singleMaterial = Array.isArray(material) ? material[0] : material;
        const job = new Job({
            name: "New Job",
            status: JobStatus.pre_submission,
            statusTrack: [],
            workflow: workflow._json,
            dataset: defaultDataset,
            ...extraConfig,
        } as JobEntity);

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
hasProjectSchemaMixin(Job.prototype);
taggableMixin(Job.prototype);
computedEntityMixin(Job.prototype);
defaultableEntityMixin(Job);
hashedEntityMixin(Job.prototype);
hasDescriptionMixin(Job.prototype);

export { Job };
export default Job;
