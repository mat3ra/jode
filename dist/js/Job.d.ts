import { type NamedInMemoryEntity, InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import { type Defaultable } from "@mat3ra/code/dist/js/entity/mixins/DefaultableMixin";
import { type HasDescription } from "@mat3ra/code/dist/js/entity/mixins/HasDescriptionMixin";
import { type HashedEntity } from "@mat3ra/code/dist/js/entity/mixins/HashedEntityMixin";
import { Taggable } from "@mat3ra/code/dist/js/entity/mixins/TaggableMixin";
import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { JobSchema as EsseJobSchema, ExtendedJobSchema } from "@mat3ra/esse/dist/js/types";
import { ComputedEntityMixin } from "@mat3ra/ide/dist/js/compute";
import type { Material } from "@mat3ra/made";
import type WodeWorkflowType from "@mat3ra/wode/dist/js/Workflow";
import { type JobSchemaMixin } from "./generated/JobSchemaMixin";
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
interface Job extends Defaultable, NamedInMemoryEntity, JobSchemaMixin, Taggable, HashedEntity, ComputedEntityMixin, HasDescription {
    compute: EsseJobSchema["compute"];
}
/**
 * Job — core non-visual model for a computational job.
 *
 * This class is host-application-agnostic. It is designed for use in
 * standalone packages (jove, job-designer) as well as in the web-app,
 * where a host-level subclass may extend it with persistence and routing.
 */
declare class Job extends InMemoryEntity {
    _json: JobSchema & AnyObject;
    _workflow?: WodeWorkflowType;
    constructor(config: JobSchema);
    /**
     * Initializes derived state (workflow instance, material references) from raw JSON.
     */
    initialize(): void;
    setProps(json: AnyObject): this;
    toJSON(): JobSchema & AnyObject;
    /**
     * Renders the workflow with the given material context.
     * Only valid when the job has a workflow and at least one material.
     */
    render(): void;
    get statusCls(): string;
    /**
     * Returns true when the job has a terminal status (finished/error/terminated/timeout).
     */
    get isInFinalStatus(): boolean;
    get isSubmitted(): boolean;
    get isActive(): boolean;
    get isError(): boolean;
    get isInInitialStatus(): boolean;
    get isInRunningStatus(): boolean;
    get statusTrack(): Array<{
        status: string;
        trackedAt: number;
    }>;
    /** Status track items in chronological order. */
    get statusTrackSorted(): Array<{
        status: string;
        trackedAt: number;
    }>;
    get submittedTimestamp(): {
        status: string;
        trackedAt: number;
    } | undefined;
    get activeTimestamp(): {
        status: string;
        trackedAt: number;
    } | undefined;
    get finalTimestamp(): {
        status: string;
        trackedAt: number;
    } | undefined;
    get hasBeenActiveMoreThanOnce(): boolean;
    /**
     * Sets the primary material for this job.
     */
    setMaterial(material: Material): void;
    /**
     * Sets multiple materials for a multi-material job.
     */
    setMaterials(materials?: Material[]): void;
    get material(): Material | undefined;
    get materials(): Material[] | undefined;
    setMaterialsSet(materialsSet: EntityReference | undefined): void;
    get materialsSet(): EntityReference | undefined;
    get workflowInstance(): WodeWorkflowType;
    setWorkflow(workflowInstance: WodeWorkflowType): void;
    get usedApplicationNames(): string[];
    setParent(parentJob: Job): void;
    unsetParent(): void;
    /**
     * Creates a new Job with sensible defaults for a given workflow and material.
     */
    static createFromWorkflow(workflow: WodeWorkflowType, material: Material | Material[], extraConfig?: Partial<JobSchema>): Job;
}
export { Job };
export default Job;
