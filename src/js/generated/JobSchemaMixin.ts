import type { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { JobSchema, ExtendedJobSchema } from "@mat3ra/esse/dist/js/types";

/**
 * Combined partial schema type for the Job mixin. Fields that conflict with
 * InMemoryEntity / NamedInMemoryEntity (_id, slug, systemName, schemaVersion,
 * name, isDefault, metadata) are omitted — they are already provided by the
 * base class hierarchy.
 */
type ConflictingKeys = "_id" | "slug" | "systemName" | "schemaVersion" | "name" | "isDefault" | "metadata";

export type JobSchemaMixin = Omit<Partial<JobSchema>, ConflictingKeys> &
    Partial<ExtendedJobSchema>;

export type JobInMemoryEntity = InMemoryEntity & JobSchemaMixin;

export function jobSchemaMixin<T extends InMemoryEntity>(
    item: InMemoryEntity,
): asserts item is T & JobSchemaMixin {
    Object.defineProperties(item, {
        workflow: {
            get(this: InMemoryEntity) {
                return this.prop("workflow");
            },
            set(this: InMemoryEntity, value: JobSchema["workflow"]) {
                this.setProp("workflow", value);
            },
            configurable: true,
            enumerable: true,
        },
        compute: {
            get(this: InMemoryEntity) {
                return this.prop("compute");
            },
            set(this: InMemoryEntity, value: JobSchema["compute"]) {
                this.setProp("compute", value);
            },
            configurable: true,
            enumerable: true,
        },
        status: {
            get(this: InMemoryEntity) {
                return this.prop("status");
            },
            set(this: InMemoryEntity, value: JobSchema["status"]) {
                this.setProp("status", value);
            },
            configurable: true,
            enumerable: true,
        },
        rmsId: {
            get(this: InMemoryEntity) {
                return this.prop("rmsId");
            },
            set(this: InMemoryEntity, value: JobSchema["rmsId"]) {
                this.setProp("rmsId", value);
            },
            configurable: true,
            enumerable: true,
        },
        startTime: {
            get(this: InMemoryEntity) {
                return this.prop("startTime");
            },
            set(this: InMemoryEntity, value: JobSchema["startTime"]) {
                this.setProp("startTime", value);
            },
            configurable: true,
            enumerable: true,
        },
        workDir: {
            get(this: InMemoryEntity) {
                return this.prop("workDir");
            },
            set(this: InMemoryEntity, value: JobSchema["workDir"]) {
                this.setProp("workDir", value);
            },
            configurable: true,
            enumerable: true,
        },
        _project: {
            get(this: InMemoryEntity) {
                return this.prop("_project");
            },
            set(this: InMemoryEntity, value: JobSchema["_project"]) {
                this.setProp("_project", value);
            },
            configurable: true,
            enumerable: true,
        },
        _material: {
            get(this: InMemoryEntity) {
                return this.prop("_material");
            },
            set(this: InMemoryEntity, value: JobSchema["_material"]) {
                this.setProp("_material", value);
            },
            configurable: true,
            enumerable: true,
        },
        parent: {
            get(this: InMemoryEntity) {
                return this.prop("parent");
            },
            set(this: InMemoryEntity, value: JobSchema["parent"]) {
                this.setProp("parent", value);
            },
            configurable: true,
            enumerable: true,
        },
        runtimeContext: {
            get(this: InMemoryEntity) {
                return this.prop("runtimeContext");
            },
            set(this: InMemoryEntity, value: JobSchema["runtimeContext"]) {
                this.setProp("runtimeContext", value);
            },
            configurable: true,
            enumerable: true,
        },
        scopeTrack: {
            get(this: InMemoryEntity) {
                return this.prop("scopeTrack");
            },
            set(this: InMemoryEntity, value: JobSchema["scopeTrack"]) {
                this.setProp("scopeTrack", value);
            },
            configurable: true,
            enumerable: true,
        },
        // ExtendedJobSchema fields
        mode: {
            get(this: InMemoryEntity) {
                return this.prop("mode");
            },
            set(this: InMemoryEntity, value: ExtendedJobSchema["mode"]) {
                this.setProp("mode", value);
            },
            configurable: true,
            enumerable: true,
        },
        isExternal: {
            get(this: InMemoryEntity) {
                return this.prop("isExternal");
            },
            set(this: InMemoryEntity, value: ExtendedJobSchema["isExternal"]) {
                this.setProp("isExternal", value);
            },
            configurable: true,
            enumerable: true,
        },
        _materials: {
            get(this: InMemoryEntity) {
                return this.prop("_materials");
            },
            set(this: InMemoryEntity, value: ExtendedJobSchema["_materials"]) {
                this.setProp("_materials", value);
            },
            configurable: true,
            enumerable: true,
        },
        _materialsSet: {
            get(this: InMemoryEntity) {
                return this.prop("_materialsSet");
            },
            set(this: InMemoryEntity, value: ExtendedJobSchema["_materialsSet"]) {
                this.setProp("_materialsSet", value);
            },
            configurable: true,
            enumerable: true,
        },
        purged: {
            get(this: InMemoryEntity) {
                return this.prop("purged");
            },
            set(this: InMemoryEntity, value: ExtendedJobSchema["purged"]) {
                this.setProp("purged", value);
            },
            configurable: true,
            enumerable: true,
        },
        purgedAt: {
            get(this: InMemoryEntity) {
                return this.prop("purgedAt");
            },
            set(this: InMemoryEntity, value: ExtendedJobSchema["purgedAt"]) {
                this.setProp("purgedAt", value);
            },
            configurable: true,
            enumerable: true,
        },
        dataset: {
            get(this: InMemoryEntity) {
                return this.prop("dataset");
            },
            set(this: InMemoryEntity, value: ExtendedJobSchema["dataset"]) {
                this.setProp("dataset", value);
            },
            configurable: true,
            enumerable: true,
        },
    });
}
