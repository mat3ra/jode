import type { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { BaseInMemoryEntitySchema, JobSchema } from "@mat3ra/esse/dist/js/types";

export type JobSchemaMixin = Omit<
    JobSchema,
    "_id" | "slug" | "systemName" | "schemaVersion" | "name" | "isDefault" | "metadata" | "workflow"
>;

export type JobInMemoryEntity = InMemoryEntity<BaseInMemoryEntitySchema & JobSchemaMixin>;

export function jobSchemaMixin<T extends InMemoryEntity>(
    item: InMemoryEntity,
): asserts item is T & JobSchemaMixin {
    // @ts-expect-error
    const properties: InMemoryEntity<JobSchemaMixin> & JobSchemaMixin = {
        get rmsId() {
            return this.prop("rmsId");
        },
        set rmsId(value: JobSchema["rmsId"]) {
            this.setProp("rmsId", value);
        },
        get status() {
            return this.requiredProp("status");
        },
        set status(value: JobSchema["status"]) {
            this.setProp("status", value);
        },
        get startTime() {
            return this.prop("startTime");
        },
        set startTime(value: JobSchema["startTime"]) {
            this.setProp("startTime", value);
        },
        get workDir() {
            return this.prop("workDir");
        },
        set workDir(value: JobSchema["workDir"]) {
            this.setProp("workDir", value);
        },
        get _material() {
            return this.prop("_material");
        },
        set _material(value: JobSchema["_material"]) {
            this.setProp("_material", value);
        },
        get _materials() {
            return this.prop("_materials");
        },
        set _materials(value: JobSchema["_materials"]) {
            this.setProp("_materials", value);
        },
        get _materialsSet() {
            return this.prop("_materialsSet");
        },
        set _materialsSet(value: JobSchema["_materialsSet"]) {
            this.setProp("_materialsSet", value);
        },
        get parent() {
            return this.prop("parent");
        },
        set parent(value: JobSchema["parent"]) {
            this.setProp("parent", value);
        },
        get runtimeContext() {
            return this.prop("runtimeContext");
        },
        set runtimeContext(value: JobSchema["runtimeContext"]) {
            this.setProp("runtimeContext", value);
        },
        get scopeTrack() {
            return this.prop("scopeTrack");
        },
        set scopeTrack(value: JobSchema["scopeTrack"]) {
            this.setProp("scopeTrack", value);
        },
        get dataset() {
            return this.prop("dataset");
        },
        set dataset(value: JobSchema["dataset"]) {
            this.setProp("dataset", value);
        },
        get purged() {
            return this.prop("purged");
        },
        set purged(value: JobSchema["purged"]) {
            this.setProp("purged", value);
        },
        get purgedAt() {
            return this.prop("purgedAt");
        },
        set purgedAt(value: JobSchema["purgedAt"]) {
            this.setProp("purgedAt", value);
        },
        get compute() {
            return this.requiredProp("compute");
        },
        set compute(value: JobSchema["compute"]) {
            this.setProp("compute", value);
        },
        get statusTrack() {
            return this.prop("statusTrack");
        },
        set statusTrack(value: JobSchema["statusTrack"]) {
            this.setProp("statusTrack", value);
        },
        get _project() {
            return this.requiredProp("_project");
        },
        set _project(value: JobSchema["_project"]) {
            this.setProp("_project", value);
        },
    };

    Object.defineProperties(item, Object.getOwnPropertyDescriptors(properties));
}
