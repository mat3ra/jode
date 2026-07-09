"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderJinjaTemplate = renderJinjaTemplate;
exports.renderConfigsFromJobMaterialsWorkflows = renderConfigsFromJobMaterialsWorkflows;
exports.setJobNameBasedOnMaterials = setJobNameBasedOnMaterials;
// @ts-expect-error — swig does not have maintained TS types
const swig_1 = __importDefault(require("swig"));
const enums_1 = require("./enums");
/**
 * Renders a Jinja/Swig template string with a given context object.
 */
function renderJinjaTemplate(content, context = {}) {
    return swig_1.default.compile(content)(context);
}
/**
 * Returns an array of job JSON configs based on the given job, materials, and optional
 * materials set. Renders workflow context for each material.
 *
 * NOTE: Do NOT modify the job config directly — the same `job` instance is reused to
 * produce configs for multiple materials to preserve unit `context` references.
 */
function renderConfigsFromJobMaterialsWorkflows({ job, materials, materialsSet, isMultiMaterial = false, }) {
    var _a, _b;
    const originalName = (_a = job.name) !== null && _a !== void 0 ? _a : "New Job";
    const configs = [];
    const isMultiMaterialJob = isMultiMaterial || Boolean((_b = job._workflow) === null || _b === void 0 ? void 0 : _b.isMultiMaterial);
    if (isMultiMaterialJob) {
        job.setName(renderJinjaTemplate(originalName, { materials }));
        job.setMaterial(materials[0]);
        job.setMaterials(materials);
        if (materialsSet) {
            job.setMaterialsSet(materialsSet);
        }
        job.render();
        const { material: _material, materials: _materials, ...jobConfig } = job.toJSON();
        configs.push(jobConfig);
    }
    else {
        materials.forEach((material) => {
            job.setName(renderJinjaTemplate(originalName, { material }));
            job.setMaterial(material);
            job.render();
            const jobConfig = { ...job.toJSON() };
            delete jobConfig.materials;
            delete jobConfig._materials;
            delete jobConfig.material;
            configs.push(jobConfig);
        });
    }
    return configs;
}
/**
 * Updates the job name to append or remove the per-material jinja suffix based on
 * whether the job is multi-material and how many materials are selected.
 */
function setJobNameBasedOnMaterials(job, materials) {
    var _a, _b;
    const { isMultiMaterial } = job.workflow;
    const hasMultipleMaterials = materials.length > 1;
    /**
     * Matches Jinja template expressions like:
     *   {{object.property}}, {{object[index].property}}, {{object.property[index].subproperty}}
     */
    const hasJinjaPattern = ((_a = job.name) !== null && _a !== void 0 ? _a : "").match(/\{\{\s*\w+(\[\d+\]|\.\w+)*(\[\d+\])*\.\w+\s*\}\}/g);
    if (!isMultiMaterial && hasMultipleMaterials && !hasJinjaPattern) {
        job.setName(`${job.name} ${enums_1.SINGLE_JOB_SUFFIX}`);
    }
    else if ((isMultiMaterial && hasJinjaPattern) || (!hasMultipleMaterials && hasJinjaPattern)) {
        job.setName(((_b = job.name) !== null && _b !== void 0 ? _b : "").replace(enums_1.SINGLE_JOB_SUFFIX, "").replace(/\s*$/, ""));
    }
}
