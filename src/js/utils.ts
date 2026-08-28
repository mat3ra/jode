import type { NamedInMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { OrderedMaterial } from "@mat3ra/wode";
// @ts-expect-error — swig does not have maintained TS types
// Constraint: Swig is compiled on in-memory strings only. Do not use file-loading features
// (like {% extends %}/{% include %}) in browser environments as fs polyfills are empty stubs.
import jinja from "swig";

import { SINGLE_JOB_SUFFIX } from "./enums";
import type { Job } from "./Job";

/** Job with guaranteed name/setName methods (provided by NamedInMemoryEntity base class). */
type NamedJob = Job & Pick<NamedInMemoryEntity, "name" | "setName">;

/**
 * Renders a Jinja/Swig template string with a given context object.
 *
 * Deliberately `precompile` + `run` rather than `compile(content)(context)`. Swig's `compile`
 * ends with `utils.extend(compiled, pre.tokens)` (swig.js:622), copying token metadata - which
 * includes a `name` key - onto the compiled function. `Function.prototype.name` is not writable,
 * so that assignment throws `TypeError: Cannot assign to read only property 'name' of function`
 * in strict mode, for ANY template, even one with no interpolation at all.
 *
 * It goes unnoticed under CommonJS (sloppy mode silently ignores the failed assignment), which is
 * why Node and the Meteor bundle are fine, but any ESM bundle - e.g. Vite pre-bundling this
 * package for job-designer's standalone app - is strict and crashes on every job save.
 *
 * `run(tpl, locals)` invokes the same precompiled template function with swig's own filters/utils,
 * exactly as `compiled()` would, and simply never touches the function object. No template
 * features are lost; `compile`'s result caching is not either, since it only caches when an
 * `options.filename` is supplied and this call site never supplies one.
 */
export function renderJinjaTemplate(content: string, context: object = {}): string {
    const { tpl } = jinja.precompile(content);
    return jinja.run(tpl, context);
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
