import type { NamedInMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { Material } from "@mat3ra/made";
import type { Job } from "./Job";
/** Job with guaranteed name/setName methods (provided by NamedInMemoryEntity base class). */
type NamedJob = Job & Pick<NamedInMemoryEntity, "name" | "setName">;
/**
 * Renders a Jinja/Swig template string with a given context object.
 */
export declare function renderJinjaTemplate(content: string, context?: object): string;
/**
 * Returns an array of job JSON configs based on the given job, materials, and optional
 * materials set. Renders workflow context for each material.
 *
 * NOTE: Do NOT modify the job config directly — the same `job` instance is reused to
 * produce configs for multiple materials to preserve unit `context` references.
 */
export declare function renderConfigsFromJobMaterialsWorkflows({ job, materials, materialsSet, isMultiMaterial, }: {
    job: NamedJob;
    materials: Material[];
    isMultiMaterial?: boolean;
    materialsSet?: object;
}): ReturnType<Job["toJSON"]>[];
/**
 * Updates the job name to append or remove the per-material jinja suffix based on
 * whether the job is multi-material and how many materials are selected.
 */
export declare function setJobNameBasedOnMaterials(job: NamedJob, materials: Material[]): void;
export {};
