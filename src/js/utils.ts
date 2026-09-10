import type { NamedInMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { OrderedMaterial } from "@mat3ra/wode";
import nunjucks from "nunjucks";

import { SINGLE_JOB_SUFFIX } from "./enums";
import type { Job } from "./Job";

/** Job with guaranteed name/setName methods (provided by NamedInMemoryEntity base class). */
type NamedJob = Job & Pick<NamedInMemoryEntity, "name" | "setName">;

/**
 * Renders a Jinja-style template string with a given context object. Only ever used here for
 * plain `{{ variable }}` interpolation (job/material names) - do not use file-loading features
 * (`{% extends %}`/`{% include %}`) in browser environments, since fs polyfills are empty stubs.
 */
export function renderJinjaTemplate(content: string, context: object = {}): string {
    return nunjucks.renderString(content, context);
}

/**
 * Returns an array of job JSON configs based on the given job, materials, and optional
 * materials set. Renders workflow context for each material.
 *
 * NOTE: Do NOT modify the job config directly — the same `job` instance is reused to
 * produce configs for multiple materials to preserve unit `context` references.
 */
export function renderConfigsFromJobMaterialsWorkflows({
    job,
    materials,
    materialsSet,
    isMultiMaterial = false,
}: {
    job: NamedJob;
    materials: OrderedMaterial[];
    isMultiMaterial?: boolean;
    materialsSet?: object;
}): ReturnType<Job["toJSON"]>[] {
    const originalName = job.name ?? "New Job";
    const configs: ReturnType<Job["toJSON"]>[] = [];
    const isMultiMaterialJob = isMultiMaterial || Boolean(job._workflow?.isMultiMaterial);

    if (isMultiMaterialJob) {
        job.setName(renderJinjaTemplate(originalName, { materials }));
        job.setMaterial(materials[0]);
        job.setMaterials(materials);

        if (materialsSet) {
            job.setMaterialsSet(materialsSet as Parameters<Job["setMaterialsSet"]>[0]);
        }

        job.render();
        configs.push(job.toJSON());
    } else {
        materials.forEach((material) => {
            job.setName(renderJinjaTemplate(originalName, { material }));
            job.setMaterial(material);
            job.render();

            const jobConfig = job.toJSON();
            delete jobConfig._materials;
            configs.push(jobConfig);
        });
    }

    return configs;
}

/**
 * Updates the job name to append or remove the per-material jinja suffix based on
 * whether the job is multi-material and how many materials are selected.
 */
export function setJobNameBasedOnMaterials(job: NamedJob, materials: OrderedMaterial[]): void {
    const isMultiMaterial = Boolean(job._workflow?.isMultiMaterial);
    const hasMultipleMaterials = materials.length > 1;

    /**
     * Matches Jinja template expressions like:
     *   {{object.property}}, {{object[index].property}}, {{object.property[index].subproperty}}
     */
    const hasJinjaPattern = (job.name ?? "").match(
        /\{\{\s*\w+(\[\d+\]|\.\w+)*(\[\d+\])*\.\w+\s*\}\}/g,
    );

    if (!isMultiMaterial && hasMultipleMaterials && !hasJinjaPattern) {
        job.setName(`${job.name} ${SINGLE_JOB_SUFFIX}`);
    } else if ((isMultiMaterial && hasJinjaPattern) || (!hasMultipleMaterials && hasJinjaPattern)) {
        job.setName((job.name ?? "").replace(SINGLE_JOB_SUFFIX, "").replace(/\s*$/, ""));
    }
}
