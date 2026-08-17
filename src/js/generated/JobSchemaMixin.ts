import type { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { ExtendedJobSchema } from "@mat3ra/esse/dist/js/types";

// Combined schema (esse's base JobSchema + ExtendedJobSchema), not esse's raw
// JobSchema alone - some fields below (mode, isExternal, _materials, ...) only
// exist on ExtendedJobSchema.
import type { JobSchema } from "../Job";

/**
 * Combined partial schema type for the Job mixin. Fields that conflict with
 * InMemoryEntity / NamedInMemoryEntity (_id, slug, systemName, schemaVersion,
 * name, isDefault, metadata) are omitted — they are already provided by the
 * base class hierarchy.
 */
type ConflictingKeys = "_id" | "slug" | "systemName" | "schemaVersion" | "name" | "isDefault" | "metadata";

export type JobSchemaMixin = Omit<Partial<JobSchema>, ConflictingKeys> &
    Partial<ExtendedJobSchema>;

export type JobInMemoryEntity = InMemoryEntity<JobSchema> & JobSchemaMixin;

export function jobSchemaMixin<T extends InMemoryEntity<JobSchema>>(
    item: InMemoryEntity<JobSchema>,
): asserts item is T & JobSchemaMixin {
    Object.defineProperties(item, {
        workflow: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("workflow");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["workflow"]) {
                this.setProp("workflow", value);
            },
            configurable: true,
            enumerable: true,
        },
        compute: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("compute");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["compute"]) {
                this.setProp("compute", value);
            },
            configurable: true,
            enumerable: true,
        },
        status: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("status");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["status"]) {
                this.setProp("status", value);
            },
            configurable: true,
            enumerable: true,
        },
        rmsId: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("rmsId");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["rmsId"]) {
                this.setProp("rmsId", value);
            },
            configurable: true,
            enumerable: true,
        },
        startTime: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("startTime");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["startTime"]) {
                this.setProp("startTime", value);
            },
            configurable: true,
            enumerable: true,
        },
        workDir: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("workDir");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["workDir"]) {
                this.setProp("workDir", value);
            },
            configurable: true,
            enumerable: true,
        },
        _project: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("_project");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["_project"]) {
                this.setProp("_project", value);
            },
            configurable: true,
            enumerable: true,
        },
        _material: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("_material");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["_material"]) {
                this.setProp("_material", value);
            },
            configurable: true,
            enumerable: true,
        },
        parent: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("parent");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["parent"]) {
                this.setProp("parent", value);
            },
            configurable: true,
            enumerable: true,
        },
        runtimeContext: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("runtimeContext");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["runtimeContext"]) {
                this.setProp("runtimeContext", value);
            },
            configurable: true,
            enumerable: true,
        },
        scopeTrack: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("scopeTrack");
            },
            set(this: InMemoryEntity<JobSchema>, value: JobSchema["scopeTrack"]) {
                this.setProp("scopeTrack", value);
            },
            configurable: true,
            enumerable: true,
        },
        // ExtendedJobSchema fields
        mode: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("mode");
            },
            set(this: InMemoryEntity<JobSchema>, value: ExtendedJobSchema["mode"]) {
                this.setProp("mode", value);
            },
            configurable: true,
            enumerable: true,
        },
        isExternal: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("isExternal");
            },
            set(this: InMemoryEntity<JobSchema>, value: ExtendedJobSchema["isExternal"]) {
                this.setProp("isExternal", value);
            },
            configurable: true,
            enumerable: true,
        },
        _materials: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("_materials");
            },
            set(this: InMemoryEntity<JobSchema>, value: ExtendedJobSchema["_materials"]) {
                this.setProp("_materials", value);
            },
            configurable: true,
            enumerable: true,
        },
        _materialsSet: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("_materialsSet");
            },
            set(this: InMemoryEntity<JobSchema>, value: ExtendedJobSchema["_materialsSet"]) {
                this.setProp("_materialsSet", value);
            },
            configurable: true,
            enumerable: true,
        },
        purged: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("purged");
            },
            set(this: InMemoryEntity<JobSchema>, value: ExtendedJobSchema["purged"]) {
                this.setProp("purged", value);
            },
            configurable: true,
            enumerable: true,
        },
        purgedAt: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("purgedAt");
            },
            set(this: InMemoryEntity<JobSchema>, value: ExtendedJobSchema["purgedAt"]) {
                this.setProp("purgedAt", value);
            },
            configurable: true,
            enumerable: true,
        },
        dataset: {
            get(this: InMemoryEntity<JobSchema>) {
                return this.prop("dataset");
            },
            set(this: InMemoryEntity<JobSchema>, value: ExtendedJobSchema["dataset"]) {
                this.setProp("dataset", value);
            },
            configurable: true,
            enumerable: true,
        },
    });
}
